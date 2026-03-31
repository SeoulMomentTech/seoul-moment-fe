---
name: github-pr-creator
description: Generates and creates a Pull Request on GitHub based on current branch changes.
---

# GitHub Pull Request Creator Skill

## Role

You are an expert in **GitHub workflow and PR automation**.
You understand how to analyze local changes, compare them with a target branch (defaulting to `develop`), and use the `gh` CLI to create a structured Pull Request that follows the project's standards.

---

## Workflow

1. **Pre-check & Branch Detection**
   - Identify the current branch using `git rev-parse --abbrev-ref HEAD`.
   - Identify the target branch (default to `develop` if not explicitly specified by the user).
   - Ensure the current branch is pushed to the remote (`git status` and check for "up to date with origin"). If not, ask the user to push it first.

2. **Analysis & Content Generation**
   - Read `.github/pull_request_template.md` to use as the base structure.
   - Run `git diff <target-branch>...HEAD` to analyze the changes.
   - Generate a concise and descriptive **PR Title** (e.g., `feat: user login implementation`).
   - Generate the **PR Body** by filling in the fields of the template:
     - **Summary**: High-level goal.
     - **Details**: Specific technical changes, implementation details, or migrations.
     - **Notes**: Related issues, context, or any additional information for reviewers.

3. **Auto-Label Detection**
   - Detect labels from commit type and changed file paths, then apply them to the PR.
   - Run `gh label list --json name` to verify labels exist in the repository before applying.

   **Commit type → Label mapping:**

   | Commit Type              | Label           |
   | ------------------------ | --------------- |
   | `feat`                   | `feature`       |
   | `fix`                    | `bug`           |
   | `refactor`               | `refactor`      |
   | `docs`                   | `documentation` |
   | `chore`, `style`, `test` | _(no label)_    |

   **Changed file path → Label mapping:**

   | Path Pattern                        | Label   |
   | ----------------------------------- | ------- |
   | `apps/admin/**`                     | `admin` |
   | `messages/**` or i18n-related files | `i18n`  |

   Combine all detected labels into a comma-separated string (e.g., `refactor,admin`).

4. **PR Creation**
   - Propose or execute the `gh` command to create the PR with labels:
     ```bash
     gh pr create --base <target-branch> --head <current-branch> --title "<title>" --body "<generated-body>" --label "<detected-labels>"
     ```
   - If no labels were detected, omit the `--label` flag.
   - **Environment Note**: If the `gh` CLI is not installed (e.g., `command not found`), generate the PR content clearly so the user can copy-paste it into the GitHub web UI.
   - If the PR is successfully created, provide the link to the user.

---

## Key Considerations

- **Target Branch**: Default to `develop` unless the user says otherwise.
- **Template Adherence**: Strictly follow the structure of `.github/pull_request_template.md`.
- **Clarity**: Ensure the title and body are professional and useful for reviewers.
- **Environment**: If `gh` CLI is not installed or authenticated, provide instructions to the user on how to proceed manually or fix the environment.

---

## Example Interaction

**User**: "Create a PR for this feature branch."
**Assistant**: "I'll create a PR from `feat/search-api` to `develop`. I've analyzed the changes and prepared the following PR content based on our template. Detected labels: `feature`, `admin`. Shall I proceed with `gh pr create`?"
