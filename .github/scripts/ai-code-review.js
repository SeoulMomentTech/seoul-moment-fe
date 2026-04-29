const fs = require("node:fs");
const path = require("node:path");

const MARKER_FULL = "<!-- ai-code-review:full -->";
const MARKER_SUMMARY = "<!-- ai-code-review:summary -->";
const ALL_MARKERS = [MARKER_FULL, MARKER_SUMMARY];
const MAX_DIFF_LENGTH = 100000;
const MODEL = "gpt-4.1";
const SUMMARY_MODEL = "gpt-4.1-mini";
const TEMPERATURE = 0.2;

const SKIP_PATTERNS = [
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /\.lock$/,
  /\.generated\.(ts|js|tsx|jsx)$/,
  /\.snap$/,
  /^public\//,
  /\.md$/,
  /\.svg$/,
  /\.(png|jpg|jpeg|gif|webp|ico)$/,
];

const FENCE_LANG_BY_EXT = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  css: "css",
  scss: "scss",
  yml: "yaml",
  yaml: "yaml",
  html: "html",
  md: "markdown",
};

function fenceLang(filePath) {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return FENCE_LANG_BY_EXT[ext] ?? "";
}

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((re) => re.test(filePath));
}

function filePriority(filePath) {
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath)) return 2;
  if (/^apps\/[^/]+\/src\//.test(filePath)) return 0;
  if (/^packages\/[^/]+\/src\//.test(filePath)) return 0;
  return 1;
}

function readIfExists(absPath) {
  try {
    return fs.readFileSync(absPath, "utf8");
  } catch {
    return "";
  }
}

function loadConventions(changedFiles) {
  const repoRoot = process.cwd();
  const sections = [];

  const root = readIfExists(path.join(repoRoot, ".claude/CLAUDE.md"));
  const general = readIfExists(path.join(repoRoot, ".claude/references/general.md"));
  const style = readIfExists(path.join(repoRoot, ".claude/references/style.md"));
  const api = readIfExists(path.join(repoRoot, ".claude/references/api.md"));

  if (root) sections.push(`## Repository Overview\n${root}`);
  if (general) sections.push(`## General Conventions\n${general}`);
  if (style) sections.push(`## Style & UI Conventions\n${style}`);
  if (api) sections.push(`## API Layer Conventions\n${api}`);

  const touchesWeb = changedFiles.some((f) => f.startsWith("apps/web/"));
  const touchesAdmin = changedFiles.some((f) => f.startsWith("apps/admin/"));
  const touchesUi = changedFiles.some((f) => f.startsWith("packages/ui/"));

  if (touchesWeb) {
    const webMd = readIfExists(path.join(repoRoot, "apps/web/.claude/CLAUDE.md"));
    if (webMd) sections.push(`## apps/web Conventions\n${webMd}`);
  }
  if (touchesAdmin) {
    const adminMd = readIfExists(path.join(repoRoot, "apps/admin/.claude/CLAUDE.md"));
    if (adminMd) sections.push(`## apps/admin Conventions\n${adminMd}`);
  }
  if (touchesUi) {
    const uiMd = readIfExists(path.join(repoRoot, "packages/ui/.claude/CLAUDE.md"));
    if (uiMd) sections.push(`## packages/ui Conventions\n${uiMd}`);
  }

  return sections.join("\n\n---\n\n");
}

function annotateDiff(diff) {
  const lines = diff.split("\n");
  let currentNewLine = 0;
  const annotated = [];

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      annotated.push(line);
    } else if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+),/);
      if (match) currentNewLine = parseInt(match[1], 10) - 1;
      annotated.push(line);
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      currentNewLine++;
      annotated.push(`${line} (line:${currentNewLine})`);
    } else if (line.startsWith(" ")) {
      currentNewLine++;
      annotated.push(line);
    } else {
      annotated.push(line);
    }
  }
  return annotated.join("\n");
}

function buildAddedLineWhitelist(files) {
  const whitelist = new Map();

  for (const file of files) {
    if (!file.patch) continue;
    const lines = file.patch.split("\n");
    let currentNewLine = 0;
    const added = new Set();

    for (const line of lines) {
      if (line.startsWith("@@")) {
        const match = line.match(/\+(\d+)(?:,\d+)?/);
        if (match) currentNewLine = parseInt(match[1], 10) - 1;
      } else if (line.startsWith("+") && !line.startsWith("+++")) {
        currentNewLine++;
        added.add(currentNewLine);
      } else if (line.startsWith(" ")) {
        currentNewLine++;
      }
    }
    whitelist.set(file.filename, added);
  }
  return whitelist;
}

function splitDiffByFile(diff) {
  const fileBlocks = [];
  const lines = diff.split("\n");
  let current = null;

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      if (current) fileBlocks.push(current);
      current = { header: line, path: null, body: [line] };
    } else if (current) {
      if (line.startsWith("+++ b/") && !current.path) {
        current.path = line.slice(6);
      }
      current.body.push(line);
    }
  }
  if (current) fileBlocks.push(current);
  return fileBlocks
    .filter((b) => b.path)
    .map((b) => ({ path: b.path, content: b.body.join("\n") }));
}

function buildPrioritizedDiff(annotatedDiff) {
  const blocks = splitDiffByFile(annotatedDiff);
  const filtered = blocks.filter((b) => !shouldSkip(b.path));
  const skipped = blocks.filter((b) => shouldSkip(b.path)).map((b) => b.path);

  filtered.sort((a, b) => filePriority(a.path) - filePriority(b.path));

  const truncated = [];
  let total = 0;
  const overflow = [];

  for (const block of filtered) {
    if (total + block.content.length > MAX_DIFF_LENGTH) {
      overflow.push(block.path);
      continue;
    }
    truncated.push(block.content);
    total += block.content.length;
  }

  return {
    diffText: truncated.join("\n"),
    skipped,
    overflow,
  };
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchAllChangedFiles(owner, repo, pullNumber, token) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100&page=${page}`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) throw new Error(`Failed to list PR files: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

const REVIEW_SCHEMA = {
  name: "code_review",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      reviews: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            path: { type: "string" },
            line: { type: "integer" },
            severity: { type: "string", enum: ["High", "Medium"] },
            type: { type: "string", enum: ["Request Changes", "Suggestion"] },
            category: {
              type: "string",
              enum: ["Stability", "Security", "Performance", "Logic", "Architecture"],
            },
            description: { type: "string" },
            suggestion: { type: "string" },
          },
          required: [
            "path",
            "line",
            "severity",
            "type",
            "category",
            "description",
            "suggestion",
          ],
        },
      },
    },
    required: ["summary", "reviews"],
  },
};

function buildSystemPrompt(conventions) {
  return `You are performing an automated Pull Request code review.

# Role
You are a **senior software engineer** with extensive production experience reviewing code in this specific monorepo. You MUST apply the project conventions below as primary criteria — do not give generic advice that contradicts them.

# Core Principles
1. **Skip Trivial Issues**: Ignore typos, formatting, subjective nitpicks, or very minor refactors. Focus ONLY on Medium/High severity issues (bugs, performance, security, architectural/convention violations).
2. **No Duplicate Reviews**: If a pattern is repeated, comment on the first occurrence only and mention it applies globally. Never review unmodified code.
3. **Actionable & Concise**: Always provide a concrete code snippet or clear instruction. No fluff.
4. **English Language**: All comments and the summary must be in **English**.
5. **Convention Compliance**: When code violates the project conventions (FSD layer rules, restricted imports, @seoul-moment/ui usage, ky/axios layer patterns, Tailwind v4 tokens), flag it as Medium or High severity with a reference to the rule.

# Diff Annotation
- Lines starting with "+" are added/modified.
- Lines starting with " " are context lines (do NOT review these).
- Lines with "(line:N)" suffix: **N is the absolute line number in the new file**. Use exactly this value.

# Severity
- **High**: Runtime errors, security vulnerabilities, critical user-facing failures, major convention violations causing bugs.
- **Medium**: Performance degradation, maintainability/scalability concerns, significant logic flaws, convention violations.

# Output
Respond with JSON matching the provided schema. Fields:
- "summary": High-level overview of the PR's impact, quality, and main concerns.
- "path": Repository-relative path. NEVER include "a/" or "b/".
- "line": Absolute line number from the "(line:N)" marker. ONLY for added/modified lines.
- "type": "Request Changes" or "Suggestion".
- "category": Stability | Security | Performance | Logic | Architecture.
- If no significant issues: return an empty "reviews" array and a brief positive "summary".

---

# Project Conventions (binding)

${conventions || "(no conventions document found)"}
`;
}

function suggestionBlock(filePath, suggestion) {
  const lang = fenceLang(filePath);
  return `\`\`\`${lang}\n${suggestion}\n\`\`\``;
}

function formatCommentBody(item) {
  const normalizedPath = item.path.replace(/^[ab]\//, "");
  return `${MARKER_FULL}\n**[${item.severity}] ${item.type}** (${item.category})\n\n${item.description}\n\n**Suggestion:**\n${suggestionBlock(normalizedPath, item.suggestion)}`;
}

function bodyHasAnyMarker(body, markers) {
  if (!body) return false;
  return markers.some((m) => body.includes(m));
}

async function deletePreviousBotComments({ owner, repo, pullNumber, token, markers }) {
  const headers = ghHeaders(token);

  const issueRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments?per_page=100`,
    { headers }
  );
  if (issueRes.ok) {
    const comments = await issueRes.json();
    for (const c of comments) {
      if (bodyHasAnyMarker(c.body, markers)) {
        await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues/comments/${c.id}`,
          { method: "DELETE", headers }
        );
      }
    }
  }

  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments?per_page=100&page=${page}`,
      { headers }
    );
    if (!res.ok) break;
    const batch = await res.json();
    for (const c of batch) {
      if (bodyHasAnyMarker(c.body, markers)) {
        await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls/comments/${c.id}`,
          { method: "DELETE", headers }
        );
      }
    }
    if (batch.length < 100) break;
    page += 1;
  }
}

async function reactToTriggerComment({ owner, repo, commentId, token }) {
  if (!commentId) return;
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}/reactions`,
    {
      method: "POST",
      headers: {
        ...ghHeaders(token),
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "eyes" }),
    }
  );
}

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const githubRepository = process.env.GITHUB_REPOSITORY;
  const pullNumber = process.env.PR_NUMBER;
  const reviewMode = process.env.REVIEW_MODE === "summary" ? "summary" : "full";
  const triggerCommentId = process.env.TRIGGER_COMMENT_ID;

  if (!token) throw new Error("Missing GITHUB_TOKEN");
  if (!openaiApiKey) throw new Error("Missing OPENAI_API_KEY");
  if (!githubRepository) throw new Error("Missing GITHUB_REPOSITORY");
  if (!pullNumber) throw new Error("Missing PR_NUMBER");

  const [owner, repo] = githubRepository.split("/");

  console.log(`Mode: ${reviewMode}, PR: #${pullNumber}, Trigger comment: ${triggerCommentId ?? "(none)"}`);

  if (triggerCommentId) {
    await reactToTriggerComment({ owner, repo, commentId: triggerCommentId, token });
  }

  const files = await fetchAllChangedFiles(owner, repo, pullNumber, token);
  const changedPaths = files.map((f) => f.filename);

  if (reviewMode === "summary") {
    return runSummary({ owner, repo, pullNumber, token, openaiApiKey, files, changedPaths });
  }
  return runFull({ owner, repo, pullNumber, token, openaiApiKey, files, changedPaths });
}

async function runFull({ owner, repo, pullNumber, token, openaiApiKey, files, changedPaths }) {
  await deletePreviousBotComments({ owner, repo, pullNumber, token, markers: ALL_MARKERS });

  const lineWhitelist = buildAddedLineWhitelist(files);

  const diffRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    }
  );
  if (!diffRes.ok) throw new Error(`Failed to fetch PR diff: ${diffRes.status}`);
  const rawDiff = await diffRes.text();
  const annotatedDiff = annotateDiff(rawDiff);
  const { diffText, skipped, overflow } = buildPrioritizedDiff(annotatedDiff);

  if (!diffText.trim()) {
    console.log("No reviewable changes after applying skip patterns.");
    await postIssueComment({
      owner,
      repo,
      pullNumber,
      token,
      body: `${MARKER_FULL}\n## AI Code Review\n\nNo reviewable source changes detected (lock files, generated files, or docs only).`,
    });
    return;
  }

  const conventions = loadConventions(changedPaths);
  const systemPrompt = buildSystemPrompt(conventions);

  console.log(
    `Reviewing ${changedPaths.length} changed files (skipped: ${skipped.length}, overflowed: ${overflow.length}). Conventions: ${conventions.length} chars.`
  );

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: TEMPERATURE,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Review the following annotated git diff. Focus on convention violations and significant issues only.\n\n${diffText}`,
        },
      ],
      response_format: { type: "json_schema", json_schema: REVIEW_SCHEMA },
    }),
  });

  if (!openaiRes.ok) {
    const errorText = await openaiRes.text();
    console.error("OpenAI API Error:", errorText);
    throw new Error(`OpenAI API failed (${openaiRes.status})`);
  }

  const result = await openaiRes.json();
  if (result.usage) {
    console.log(
      `Tokens — prompt: ${result.usage.prompt_tokens}, completion: ${result.usage.completion_tokens}, total: ${result.usage.total_tokens}`
    );
  }

  const reviewData = JSON.parse(result.choices[0].message.content);

  const validReviews = [];
  const droppedReviews = [];
  for (const item of reviewData.reviews ?? []) {
    const normalizedPath = item.path.replace(/^[ab]\//, "");
    const allowedLines = lineWhitelist.get(normalizedPath);
    if (!allowedLines || !allowedLines.has(Number(item.line))) {
      droppedReviews.push(`${normalizedPath}:${item.line}`);
      continue;
    }
    validReviews.push({ ...item, path: normalizedPath });
  }
  if (droppedReviews.length > 0) {
    console.warn(`Dropped ${droppedReviews.length} out-of-range reviews:`, droppedReviews);
  }

  const comments = validReviews.map((item) => ({
    path: item.path,
    line: Number(item.line),
    side: "RIGHT",
    body: formatCommentBody(item),
  }));

  const summaryBody = buildFullSummaryBody({
    summary: reviewData.summary,
    skipped,
    overflow,
    droppedCount: droppedReviews.length,
    reviewCount: comments.length,
  });

  if (comments.length === 0) {
    await postIssueComment({ owner, repo, pullNumber, token, body: summaryBody });
    console.log("Posted summary-only comment (no inline issues).");
    return;
  }

  const reviewRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    {
      method: "POST",
      headers: { ...ghHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ body: summaryBody, event: "COMMENT", comments }),
    }
  );

  if (reviewRes.ok) {
    console.log(`Posted review with ${comments.length} inline comments.`);
    return;
  }

  const reviewError = await reviewRes.text();
  console.error("Bulk review post failed:", reviewError);
  console.warn("Falling back to summary-only comment.");
  await postIssueComment({ owner, repo, pullNumber, token, body: summaryBody });
}

async function runSummary({ owner, repo, pullNumber, token, openaiApiKey, files, changedPaths }) {
  await deletePreviousBotComments({ owner, repo, pullNumber, token, markers: [MARKER_SUMMARY] });

  const reviewable = files.filter((f) => !shouldSkip(f.filename));
  if (reviewable.length === 0) {
    await postIssueComment({
      owner,
      repo,
      pullNumber,
      token,
      body: `${MARKER_SUMMARY}\n## AI Code Review (incremental)\n\nLatest push contains no reviewable source changes (lock/generated/docs only).\n\n> Run \`/review\` in a comment to trigger a full code review.`,
    });
    return;
  }

  const fileSummaries = reviewable
    .slice(0, 30)
    .map((f) => `- \`${f.filename}\` (+${f.additions}/-${f.deletions}, status: ${f.status})`)
    .join("\n");
  const more = reviewable.length > 30 ? `\n…and ${reviewable.length - 30} more file(s)` : "";

  const systemPrompt = `You produce a brief incremental summary of a Pull Request push.
Output exactly 1-3 sentences in English describing:
- What changed (which app/package, what kind of change)
- Notable scope (new feature, refactor, fix, config, etc.)

Do NOT review for bugs or suggest changes. Do NOT use bullet points. Be concise.`;

  const userPrompt = `Files changed in this push:\n${fileSummaries}${more}\n\nWrite the summary now.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SUMMARY_MODEL,
      temperature: TEMPERATURE,
      max_tokens: 200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errorText = await openaiRes.text();
    console.error("OpenAI API Error:", errorText);
    throw new Error(`OpenAI API failed (${openaiRes.status})`);
  }

  const result = await openaiRes.json();
  if (result.usage) {
    console.log(
      `Tokens (summary) — prompt: ${result.usage.prompt_tokens}, completion: ${result.usage.completion_tokens}, total: ${result.usage.total_tokens}`
    );
  }

  const summaryText = result.choices[0].message.content.trim();

  const body = `${MARKER_SUMMARY}\n## AI Code Review (incremental)\n\n${summaryText}\n\n---\n\n- ${changedPaths.length} file(s) changed in this push.\n- Run \`/review\` in a comment for a full convention-aware review.`;

  await postIssueComment({ owner, repo, pullNumber, token, body });
  console.log("Posted incremental summary comment.");
}

function buildFullSummaryBody({ summary, skipped, overflow, droppedCount, reviewCount }) {
  const parts = [
    MARKER_FULL,
    "## AI Code Review",
    "",
    summary || "No significant issues found.",
  ];
  const notes = [];
  if (reviewCount > 0) notes.push(`Posted ${reviewCount} inline comment(s).`);
  if (skipped.length > 0) notes.push(`Skipped ${skipped.length} file(s) (lock/generated/docs).`);
  if (overflow.length > 0) notes.push(`${overflow.length} file(s) omitted due to size limit: ${overflow.slice(0, 5).join(", ")}${overflow.length > 5 ? "…" : ""}`);
  if (droppedCount > 0) notes.push(`Dropped ${droppedCount} review(s) targeting non-modified lines.`);
  if (notes.length > 0) {
    parts.push("", "---", "", ...notes.map((n) => `- ${n}`));
  }
  return parts.join("\n");
}

async function postIssueComment({ owner, repo, pullNumber, token, body }) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    {
      method: "POST",
      headers: { ...ghHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
  if (!res.ok) {
    console.error("Failed to post issue comment:", await res.text());
  }
}

run().catch((err) => {
  console.error("Workflow failed:", err);
  process.exit(1);
});
