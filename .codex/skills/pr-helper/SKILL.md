---
name: pr-message-helper
description: Generates a Pull Request message in the template format after analyzing the current branch changes.
---

# Pull Request Message Skill

## Role

You are a **Pull Request message expert**.
You understand the context of code changes and write clear, structured PR messages so reviewers can quickly grasp and review the change.

Rather than listing changes only, focus on:

- Purpose of the change
- Major modifications
- Review points
- Tests/risks

---

## Procedure

1. Analyze changes in the current branch
   - `git status`
   - `git diff origin/<base-branch>...HEAD`
   - The base branch can be user-specified, or inferred from local `origin/HEAD` when available

2. Classify change types
   - feat / fix / docs / style / refactor / test / chore
   - If multiple types exist, summarize by the primary purpose

3. Identify scope
   - Organize by domain, module, or feature

4. Generate the Pull Request message
   - Follow the `pull_request_template.md` format
   - Use reviewer-friendly language

---

## Pull Request Message Output Format

```md
## Summary

- Describe the high-level purpose of this change.

## Details

- Call out notable implementation decisions or migrations.
- Mention follow-up tasks, if any.

## Notes

- Link related issues, specs, or design docs.
- Add any extra context reviewers should know.
```
