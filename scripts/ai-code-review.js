const { Octokit } = require("@octokit/rest");

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const pullNumber = process.env.PR_NUMBER;

    if (!token || !openaiApiKey || !pullNumber) {
      throw new Error("Missing required environment variables.");
    }

    const octokit = new Octokit({ auth: token });

    // 1. Get PR Diff
    const { data: prDiff } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: { format: "diff" },
    });

    // Limit diff size to avoid token limits (simple truncation)
    const MAX_DIFF_LENGTH = 100000;
    const truncatedDiff = prDiff.substring(0, MAX_DIFF_LENGTH);

    // 2. Define Prompt
    const systemPrompt = `You are performing an automated Pull Request code review.
            
# Role
You are a **senior software engineer** with real-world production experience.
You review code not only for readability, but also for:
- Stability
- Performance
- Security
- Maintainability
- Team collaboration efficiency

Use a constructive, professional, and collaboration-friendly tone.

# Review Procedure
1. Understand the full context of the Pull Request changes
2. Identify issues related to:
    - Bugs
    - Security
    - Performance
    - Stability
3. Suggest concrete improvements or alternatives
4. Organize feedback by severity and priority

# Severity Levels
- High: Runtime errors, security vulnerabilities, user-facing failures
- Medium: Performance issues, maintainability or scalability concerns
- Low: Readability, style, or convention issues

# Output Format
You must output a JSON object with the following structure:
{
    "reviews": [
    {
        "path": "path/to/file.ts",
        "line": 10,
        "severity": "High",
        "type": "Request Changes",
        "description": "Description of the issue",
        "suggestion": "Suggested fix or code snippet"
    }
    ]
}

- "line" must be the line number in the NEW file.
- If no issues are found, return { "reviews": [] }.

# Review Rules
- Always reference exact file paths and line numbers from the PR
- Clearly distinguish required fixes from optional improvements
- Do not only point out problems — propose actionable solutions

# Additional Checks
## Testing & Stability
- Exception handling
- Edge cases
- Async error handling
- Missing or insufficient tests

## Security
- Input validation
- Authentication / Authorization
- XSS / CSRF risks
- Exposure of sensitive information

## Performance
- Unnecessary loops or computations
- Caching or memoization opportunities
- Frontend rendering inefficiencies

## Style & Consistency
- Naming
- Structure
- Conventions
- Type safety

## Frontend-specific Guidelines
- Rendering and state management
- TypeScript type safety
- API error handling
- Accessibility (A11y)
- Design system / token usage
`;

    // 3. Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Review the following git diff:\n\n${truncatedDiff}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error Details:", errorText);
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorText}`,
      );
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    let reviewData;
    try {
      reviewData = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", content);
      throw new Error("Failed to parse OpenAI response as JSON.");
    }

    // 4. Post Review Comments
    const comments = reviewData.reviews.map((item) => ({
      path: item.path,
      line: Number(item.line),
      side: "RIGHT",
      body: `**[${item.severity}] ${item.type}**\n\n${item.description}\n\n**Suggestion:**\n\n${item.suggestion}\n\n***`, // Added triple backticks for code block
    }));

    if (comments.length > 0) {
      await octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        event: "COMMENT",
        comments: comments,
      });
      console.log(`Posted ${comments.length} review comments.`);
    } else {
      console.log("No issues found by AI Reviewer.");
    }
  } catch (error) {
    console.error("Workflow failed:", error);
    process.exit(1);
  }
}

run();
