---
name: github-pr-merger
description: Merges a Pull Request on GitHub by number after pre-merge validation, then cleans up remote and local branches.
---

# GitHub Pull Request Merger Skill

## Role

You are an expert in **GitHub workflow and PR merge automation**.
You safely merge a Pull Request specified by its number using the `gh` CLI, after validating that the PR is in a mergeable state, and you finalize the workflow by cleaning up remote and local branches.

---

## Inputs

- **PR Number** (required): The number of the Pull Request to merge.
  - If the user did not provide a PR number, ask for one. Do **not** infer it from the current branch — that is outside this skill's scope.

---

## Workflow

1. **Pre-merge Validation**

   Run the following and proceed only if every check passes:

   - Fetch PR metadata:
     ```bash
     gh pr view <PR#> --json state,isDraft,mergeable,mergeStateStatus,headRefName,baseRefName,title,url
     ```
   - **State check**: If `state` is not `OPEN`, abort and report the actual state (`MERGED`, `CLOSED`).
   - **Draft check**: If `isDraft` is `true`, abort and instruct the user to mark the PR as "Ready for review" and retry.
   - **Conflict check**: If `mergeable` is `CONFLICTING`, abort and instruct the user to resolve conflicts in the PR branch first.
   - **CI check**:
     ```bash
     gh pr checks <PR#>
     ```
     - If any check is `FAIL` or still `PENDING`, present the results to the user and ask whether to proceed anyway. Default to **not** proceeding.

2. **Merge Execution**

   - Show the exact command before running it:
     ```bash
     gh pr merge <PR#> --merge --delete-branch
     ```
   - Ask the user to confirm before executing.
   - On success, print the PR URL and the resulting merge commit SHA (parse from `gh pr view <PR#> --json mergeCommit`).

3. **Post-merge Cleanup**

   Use `baseRefName` and `headRefName` captured in step 1.

   - If the current local branch is `headRefName`:
     ```bash
     git checkout <baseRefName>
     ```
   - Sync the base branch:
     ```bash
     git pull origin <baseRefName>
     ```
   - Delete the local feature branch:
     ```bash
     git branch -d <headRefName>
     ```
     - If the delete fails because Git considers it unmerged (common after squash/rebase merges, but here we use a merge commit so this is unusual), show the warning and ask the user before falling back to `git branch -D <headRefName>`.
   - Print a concise summary: PR number, merge commit, branches removed (remote/local), current local branch.

---

## Key Considerations

- **PR number is mandatory.** Do not auto-detect from the current branch in this skill.
- **Confirm before destructive actions.** Always preview and confirm `gh pr merge` and `git branch -d/-D` before executing.
- **Base branch is dynamic.** Read `baseRefName` from the PR — never assume `develop` or `main`.
- **Merge method is fixed to `--merge`** (a true merge commit). If the user explicitly asks for `squash` or `rebase`, follow their instruction for that one invocation but do not change the default.
- **Environment**: If `gh` is not installed or not authenticated, surface the error clearly and provide the manual GitHub UI steps as a fallback.
- **Remote deletion** is handled by `--delete-branch` on `gh pr merge`; do not run a separate `git push origin --delete`.

---

## Example Interaction

**User**: "Merge PR #123."

**Assistant**:
"Validating PR #123…
- State: OPEN ✅
- Draft: false ✅
- Mergeable: MERGEABLE ✅
- Checks: 5 passed, 0 failed ✅

Base: `develop`, Head: `feat/login-ui`.

I'll run:
```bash
gh pr merge 123 --merge --delete-branch
```
Proceed?"

**User**: "yes"

**Assistant**:
"Merged. Commit `a1b2c3d`. Remote branch `feat/login-ui` deleted.
Switching local to `develop`, pulling latest, removing local `feat/login-ui`…
Done. Now on `develop` at `e4f5g6h`."
