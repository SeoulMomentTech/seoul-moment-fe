function annotateDiff(diff) {
  const lines = diff.split("\n");
  let currentNewLine = 0;
  let annotatedDiff = [];

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      annotatedDiff.push(line);
    } else if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+),/);
      if (match) {
        currentNewLine = parseInt(match[1], 10) - 1;
      }
      annotatedDiff.push(line);
    } else if (line.startsWith("+")) {
      currentNewLine++;
      annotatedDiff.push(`${line} (line:${currentNewLine})`);
    } else if (line.startsWith(" ")) {
      currentNewLine++;
      annotatedDiff.push(line);
    } else {
      annotatedDiff.push(line);
    }
  }
  return annotatedDiff.join("\n");
}

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const githubRepository = process.env.GITHUB_REPOSITORY;
    const pullNumber = process.env.PR_NUMBER;

    if (!token) throw new Error("Missing GITHUB_TOKEN environment variable.");
    if (!openaiApiKey) throw new Error("Missing OPENAI_API_KEY environment variable.");
    if (!githubRepository) throw new Error("Missing GITHUB_REPOSITORY environment variable.");
    if (!pullNumber) throw new Error("Missing PR_NUMBER environment variable.");

    const [owner, repo] = githubRepository.split("/");

    // 1. Get PR Diff
    const diffResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.diff",
        },
      }
    );

    if (!diffResponse.ok) {
      throw new Error(`Failed to fetch PR diff: ${diffResponse.statusText}`);
    }

    const prDiff = await diffResponse.text();
    const annotatedDiff = annotateDiff(prDiff);

    // Limit diff size to avoid token limits (simple truncation)
    const MAX_DIFF_LENGTH = 100000;
    const truncatedDiff = annotatedDiff.substring(0, MAX_DIFF_LENGTH);

    // 2. Define Prompt
    const systemPrompt = `You are performing an automated Pull Request code review.

# Role
You are a **senior software engineer** with extensive production experience.
Your goal is to provide high-quality feedback that ensures:
- **Stability**: Exception handling, edge cases, async error management.
- **Security**: Input validation, Auth/Authz, XSS/CSRF, secret exposure.
- **Performance**: Redundant operations, caching/memoization, FE rendering efficiency.
- **Maintainability**: Clear naming, structure, project conventions, Type safety.
- **Frontend Best Practices**: State management, API error handling, A11y, and Design Token usage.

# Review Procedure
1. Understand the full context of the Pull Request changes.
2. The provided diff has been annotated with line numbers:
   - Lines starting with "+" are added/modified.
   - Lines starting with " " are context lines.
   - Some lines have an extra marker like "(line:N)" at the end. **N is the absolute line number in the new file.**
3. Identify issues based on the checklist below and suggest concrete improvements.

# Severity Levels
- **High**: Runtime errors, security vulnerabilities, critical user-facing failures.
- **Medium**: Performance degradation, maintainability/scalability concerns, logic flaws.
- **Low**: Readability, style, convention, minor optimizations.

# Output Format
You must output a JSON object with the following structure:
{
    "reviews": [
    {
        "path": "path/to/file.ts",
        "line": 10,
        "severity": "High",
        "type": "Request Changes",
        "category": "Security",
        "description": "Description of the issue",
        "suggestion": "Suggested fix or code snippet"
    }
    ]
}

- "path": Relative file path from the repository root. DO NOT include "a/" or "b/".
- "line": The absolute line number (N) from the "(line:N)" marker in the diff.
- "type": "Request Changes" (for High/Medium) or "Suggestion" (for Low).
- "category": Choose from [Stability, Security, Performance, Style, Frontend, Logic].
- **CRITICAL**: You MUST only provide reviews for lines that have been **added or modified** (lines starting with "+").

# Tone and Rules
- Be professional, non-aggressive, and collaborative.
- Use evidence-based feedback.
- Do not just point out problems — always propose actionable solutions or alternative code snippets.
- Distinguish between mandatory fixes and optional suggestions.
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
            content: `Review the following annotated git diff:\n\n${truncatedDiff}`,
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
    const comments = reviewData.reviews.map((item) => {
      const normalizedPath = item.path.replace(/^b\//, "");
      
      return {
        path: normalizedPath,
        line: Number(item.line),
        side: "RIGHT",
        body: `**[${item.severity}] ${item.type}** (${item.category})\n\n${item.description}\n\n**Suggestion:**\n\`\`\`typescript\n${item.suggestion}\n\`\`\``,
      };
    });

    if (comments.length > 0) {
      console.log(`Attempting to post ${comments.length} comments to PR #${pullNumber}...`);
      
      const payload = {
        event: "COMMENT",
        comments: comments,
      };

      const reviewResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!reviewResponse.ok) {
        const reviewError = await reviewResponse.text();
        console.error("GitHub API Error Details:", reviewError);
        console.warn("Bulk post failed. Attempting to post comments one by one...");
        
        for (const comment of comments) {
            try {
                const singleResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(comment),
                    }
                );
                if (!singleResponse.ok) {
                    const singleError = await singleResponse.text();
                    console.error(`Failed to post comment at ${comment.path}:${comment.line}:`, singleError);
                } else {
                    console.log(`Posted comment at ${comment.path}:${comment.line}`);
                }
            } catch (singleErr) {
                console.error("Error posting single comment:", singleErr);
            }
        }
      } else {
        console.log(`Successfully posted ${comments.length} review comments.`);
      }
    } else {
      console.log("No issues found by AI Reviewer.");
    }
  } catch (error) {
    console.error("Workflow failed:", error);
    process.exit(1);
  }
}

run();