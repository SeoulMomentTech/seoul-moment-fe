---
name: git-rebase-helper
description: Rebases the current feature branch onto an updated base branch (default develop), guiding through conflict resolution and safe force-push.
---

# Git Rebase Helper Skill

## Role

You are an expert in **Git rebase workflows**.
You safely rebase the user's current feature branch onto the latest tip of a base branch, guide them through any conflicts, and finalize with a safe force-push when appropriate.

---

## Inputs

- **Base branch** (optional): The branch to rebase onto. Defaults to `develop`. Accept `main`, `master`, or any other branch the user specifies.
- **Force push**: After a successful rebase, **always ask the user** whether to push. Never push automatically, even if the prior rebase was clean or the user has confirmed pushes earlier in the session. When pushing, use `--force-with-lease` only.

---

## Workflow

1. **Pre-rebase Checks**

   Run all of the following and abort if any fail:

   - Current branch:
     ```bash
     git rev-parse --abbrev-ref HEAD
     ```
     - If the current branch equals the target base branch, abort — there is nothing to rebase.
   - Working tree clean:
     ```bash
     git status --porcelain
     ```
     - If output is non-empty, abort and ask the user to commit, stash (`git stash push -m "pre-rebase"`), or discard changes first. Do not auto-stash without confirmation.
   - In-progress rebase guard:
     - If `.git/rebase-merge` or `.git/rebase-apply` exists, abort and inform the user that a rebase is already in progress (`git rebase --continue` / `--abort`).

2. **Update the Base Branch**

   ```bash
   git fetch origin <base-branch>
   ```

   - We rebase onto `origin/<base-branch>` directly — no local checkout/pull is required and avoids polluting the user's local base branch.

3. **Rebase Execution**

   - Show the exact command and confirm:
     ```bash
     git rebase origin/<base-branch>
     ```
   - Run it.

4. **Conflict Handling**

   If the rebase stops due to conflicts:

   - List conflicted files:
     ```bash
     git diff --name-only --diff-filter=U
     ```
   - Present each conflicted file to the user. Offer to:
     - Open and resolve them collaboratively (read the file, propose a resolution, apply with Edit).
     - Or pause and let the user resolve manually.
   - After each resolution, stage the file (`git add <path>`) and continue:
     ```bash
     git rebase --continue
     ```
   - At any point, the user can request `git rebase --abort` to bail out — surface this option clearly.

5. **Post-rebase Verification**

   Once the rebase finishes successfully:

   - Confirm head state:
     ```bash
     git log --oneline -10
     git status
     ```
   - Run repository-specific quick checks if obvious (e.g., type-check or lint) — but only suggest, do not run heavy CI by default.

6. **Force Push — Always Ask**

   - **Always** prompt the user explicitly: "Push the rebased branch with `--force-with-lease`? (yes / no)". Do this even if the rebase had no conflicts and even if the user previously approved pushes in this session.
   - Only on explicit `yes`, run:
     ```bash
     git push --force-with-lease origin <current-branch>
     ```
   - **Never** use plain `--force`. Always prefer `--force-with-lease` to avoid clobbering teammates' commits.
   - If the branch is shared (e.g., another collaborator is pushing to it), warn the user before force-pushing.
   - If the user declines, stop here and remind them they can push later with the same `git push --force-with-lease` command.

---

## Key Considerations

- **Working tree must be clean.** Refuse to start a rebase otherwise; the user controls how to handle uncommitted work.
- **Rebase onto remote tip.** Use `origin/<base-branch>` after `git fetch` rather than relying on a possibly-stale local copy.
- **No silent destructive actions.** Confirm before `git rebase`, `git rebase --abort`, and any `git push --force-with-lease`.
- **Conflict-by-conflict workflow.** Resolve, stage, and continue — do not batch unrelated edits with conflict resolutions.
- **Force-push safety.** Always ask the user before pushing — never push automatically. `--force-with-lease` only; warn loudly when pushing a shared branch.
- **Default base is `develop`** for this monorepo, but always honor an explicitly provided base branch.
- **Environment**: If `git` reports detached HEAD or an in-progress merge, surface the state and stop.

---

## Example Interaction

**User**: "Rebase my branch onto develop."

**Assistant**:
"Pre-checks:
- Current branch: `feat/login-ui` ✅
- Working tree: clean ✅
- No rebase in progress ✅

I'll run:
```bash
git fetch origin develop
git rebase origin/develop
```
Proceed?"

**User**: "yes"

**Assistant**:
"Fetched. Rebase finished cleanly — replayed 4 commits on top of `origin/develop` (now at `e4f5g6h`).

Your branch tracks `origin/feat/login-ui`. Force-push with `--force-with-lease`?"

**User**: "yes"

**Assistant**:
"Pushed. `feat/login-ui` is now on top of latest `develop`."

---

## Conflict Example

**Assistant**:
"Conflict during rebase. 2 files need resolution:
- `apps/web/src/features/auth/login-form.tsx`
- `apps/web/src/shared/api/auth.ts`

Want me to open the first file and propose a resolution, or will you handle them?

To bail out at any point: `git rebase --abort`."
