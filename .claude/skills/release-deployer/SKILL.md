---
name: release-deployer
description: Runs a production release end to end — infers the version bump from Conventional Commits, opens a release PR into develop, promotes develop to main via PR, then tags and publishes a GitHub Release. Use for "배포해줘", "릴리즈해줘", "라이브 배포", "버전 올려서 배포", "release", "deploy to production", "promote develop to main".
---

# Release Deployer Skill

## Role

You are the **release manager** for this monorepo. You take the accumulated work on `develop`, decide the version, record it in `package.json` + `CHANGELOG.md`, promote it to `main` through reviewable PRs, and tag the result.

`main` is the production branch — Netlify builds it automatically on push. **Merging into `main` is a live deployment.** Treat it accordingly.

---

## Scope boundary

| In scope | Out of scope |
|---|---|
| Version inference and bump | Verifying the Netlify deploy succeeded |
| CHANGELOG generation | Netlify configuration changes |
| Release PR → `develop` | Hotfix releases directly onto `main` |
| Promotion PR → `main` | Publishing packages to npm (all are `private: true`) |
| git tag + GitHub Release | |

Netlify posts **no** GitHub commit status, check-run, or deployment for this repo, and the Netlify CLI is not installed locally. There is no reliable signal to poll, so **never claim the deploy succeeded.** Stop at "merged to `main` — Netlify build is running, check the dashboard."

---

## Release model

- **Per-app versioning.** Only apps actually included in the release get bumped. `apps/web` and `apps/admin` version independently.
- **Tags are app-scoped**: `web-v0.2.0`, `admin-v0.1.0`. Never a bare `v0.2.0`.
- **CHANGELOG is app-scoped**: `apps/web/CHANGELOG.md`, `apps/admin/CHANGELOG.md`. No root CHANGELOG.
- Root `package.json`, `packages/ui`, and the config packages are **not** bumped by this skill.

---

## Workflow

Each phase is **re-enterable**. If an open `chore/release-*` PR already exists, skip Phase 2 and resume from it.

### Phase 0 — Preflight

Run all of these and abort on the first failure:

```bash
gh auth status
git fetch origin --prune --tags
git status --porcelain                                    # must be empty
git rev-list --count origin/main..origin/develop          # must be > 0
gh pr list --state open --json number,headRefName,title,url
```

- **Dirty tree** → abort. Ask the user to commit or stash first.
- **`main..develop` is 0** → abort: "`develop` has nothing `main` doesn't. Nothing to release."
- **An open PR whose `headRefName` matches `chore/release-*`** → a release is already in flight. Report it and resume at Phase 2's CI-wait step instead of creating a new branch.

**Hotfix drift check — warn, do not block:**

```bash
git log --no-merges --cherry-pick --right-only origin/develop...origin/main \
  --format='%h %ad %s' --date=short
```

Every flag here matters. A plain `git rev-list --count origin/develop..origin/main` returns **194** on this repo and would block every release forever:

- `--no-merges` drops the ~191 `Merge branch 'develop'` release merges. Those live only on `main` by construction and are meaningless as drift.
- `--cherry-pick --right-only` drops commits whose patch already landed on `develop` under a different SHA — routine when the same fix is applied to both branches.

Then judge what survives:

- **A commit newer than the last release tag** → likely a real hotfix that never reached `develop`. Report it and recommend back-merging `main` → `develop` first (see `git-rebase-helper`). Let the user decide; do not abort on your own.
- **Anything older** → legacy noise. Report it in one line and continue.

Promotion itself is safe either way: `git merge` unions both sides, so merging `develop` into `main` **never reverts** a `main`-only commit. The actual risk drift creates is that `develop`-based work can later regress a fix that only exists on `main` — a warning, not a release blocker.

**Known-benign baseline** (verified 2026-08-19) — these two always survive the filters and can be ignored:

| Commit | Date | Why benign |
|---|---|---|
| `df4e59d chore(web): add Google AdSense ads.txt` | 2026-06-22 | `apps/web/public/ads.txt` exists on **both** branches; only the SHAs differ |
| `db7df45 feat: enhance Partners component to handle empty states` | 2025-11-02 | Pre-monorepo path (`src/features/about/...`), superseded by the restructure |

If the filtered list contains only these, say "no pending hotfixes" and move on.

### Phase 1 — Release scope and version inference

1. Collect changed paths:
   ```bash
   git diff --name-only origin/main...origin/develop
   ```

2. Decide which apps are in the release. Shared packages affect both apps:

   | App | Included if any path matches |
   |---|---|
   | `web` | `apps/web/**`, `packages/ui/**`, `packages/tailwind-config/**`, `pnpm-lock.yaml`, root `package.json` |
   | `admin` | `apps/admin/**`, `packages/ui/**`, `packages/tailwind-config/**`, `pnpm-lock.yaml`, root `package.json` |

   Changes confined to `packages/eslint-config`, `packages/prettier-config`, `.github/`, `.claude/`, `docs/`, `turbo.json`, or `.vscode/` release no app. If no app qualifies, abort: "no user-facing app changed — nothing to release."

   `pnpm-lock.yaml` and root `package.json` include **both** apps because dependency resolution and `pnpm.overrides` (react, `@types/react`, postcss) change what both builds produce. This over-triggers — admin can get a patch bump for a web-only dependency — which is the deliberate trade-off: a spurious patch bump is cheaper than shipping an unversioned change.

3. Find each app's baseline:
   ```bash
   git tag -l 'web-v*' --sort=-v:refname | head -1
   ```
   If no tag exists, use the app's current `package.json` version as the baseline and label it **first release**.

4. Collect the commits in scope (baseline → `develop`, restricted to that app's paths):
   ```bash
   git log <baseline-tag-or-origin/main>..origin/develop --no-merges \
     --format='%h %s' -- apps/web packages/ui packages/tailwind-config
   ```

   `--no-merges` is mandatory. This repo merges PRs with merge commits, so ~21 of the 49 commits in the current range have subjects like `Merge pull request #262 from SeoulMomentTech/…`. Without the flag they carry no Conventional type, land in the CHANGELOG's "Other" section as noise, and inflate every count.

5. Infer the bump. Apply the **first** rule that matches any commit:

   | Signal in any commit subject/body | Bump |
   |---|---|
   | `BREAKING CHANGE:` or `<type>!:` | **major** |
   | `feat` | **minor** |
   | `fix` or `perf` | **patch** |
   | only `chore`/`docs`/`style`/`test`/`ci`/`refactor` | **patch**, and say "no functional changes in this release" |

6. Present a table and get confirmation. The user may override any individual version. Real output for the current `main..develop` range, for calibration:

   ```
   app     current → proposed   basis
   web     0.1.0   → 0.2.0      24 commits: feat 6, fix 5, refactor 4, chore 7, perf 1, docs 1   (first release)
   admin   0.0.0   → 0.1.0      5 commits: feat 1, fix 1, chore 3                                (first release)
   ```

7. **Warn if the release contains only shared-package changes** (no `apps/<app>/**` paths). `apps/web/netlify.toml` gates its build on `git diff --quiet HEAD^ HEAD apps/web/`, so a `packages/ui`-only change will **not** trigger a Netlify rebuild. Say so before proceeding — the version and tag will still be correct, but nothing new goes live.

### Phase 2 — Release PR into `develop` (auto-merged on green CI)

```bash
git checkout develop && git pull --ff-only origin develop
git checkout -b chore/release-web-0.2.0
```

Branch name: `chore/release-<app>-<version>`, joined for multiple apps — `chore/release-web-0.2.0-admin-0.1.0`.

**Edits — nothing beyond these:**

- The `version` field of each bumped app's `package.json`. Nothing else in the file.
- Prepend a new section to that app's `CHANGELOG.md` (create the file if absent):

  ```markdown
  ## 0.2.0 — 2026-08-19

  ### Features

  - Add product image zoom modal (`abc1234`)

  ### Fixes

  - Constrain product category filter to the grid width (`def5678`)

  ### Other

  - Enforce FSD downward-only imports in web ESLint (`9012abc`)
  ```

  Newest section on top. Use the commit subject with the `<type>(scope):` prefix stripped. Omit empty sections.

- **Do not regenerate `pnpm-lock.yaml`.** Every workspace package is `private: true`, so a version change does not touch the lockfile. Run `git status --porcelain` after editing and abort if anything unexpected is staged.

Then:

```bash
git add apps/web/package.json apps/web/CHANGELOG.md
git commit -m "chore(release): web v0.2.0"
git push -u origin chore/release-web-0.2.0
gh pr create --base develop --title "chore(release): web v0.2.0" --body "<body>"
```

- Stage **explicit paths**, never `git add -A`. Only the bumped `package.json` and `CHANGELOG.md` files belong in this commit.
- The husky pre-commit hook blocks commits made directly on `develop` — which is exactly why Phase 2 works on a `chore/release-*` branch. `.lintstagedrc` matches only `apps/*/src/**/*.{js,ts,jsx,tsx}`, so `package.json` and `CHANGELOG.md` are **not** reformatted on commit; what you wrote is what lands.
- Multi-app commit/title: `chore(release): web v0.2.0, admin v0.1.0`.
- Body follows `.github/pull_request_template.md` (Summary / Details / Notes). Put the generated CHANGELOG section under **Details**.
- No `--label`: per `github-pr-creator`, `chore` has no label mapping.

Wait for CI (`ci.yml` runs typecheck + lint on PRs to `develop`):

```bash
gh pr checks <n> --watch --fail-fast
```

- **On failure**: stop. Leave the branch and PR in place, report the failing job's log URL, and let the user fix it. Never bypass, never merge anyway.
- **On success**, merge without asking — a merge into `develop` is cheap to undo:
  ```bash
  gh pr merge <n> --merge --delete-branch
  ```

### Phase 3 — Production gate

```bash
git checkout develop && git pull --ff-only origin develop
```

Confirm the release commit is on `develop`, then present the release summary:

- apps and versions being released
- commit count since the baseline tag
- the CHANGELOG sections verbatim
- an explicit note that the next step deploys to production

**Ask for explicit confirmation and wait for it.** This gate is never skipped, never inferred from earlier approval, and never bundled into another question.

### Phase 4 — Promotion PR into `main`

```bash
gh pr create --base main --head develop \
  --title "release: web v0.2.0" \
  --body "<CHANGELOG + link to the Phase 2 PR>"
```

Two traps — read both before running anything:

1. **There are no checks on this PR.** `ci.yml` triggers only on `branches: [develop]`, so a PR into `main` has zero checks and `gh pr checks` may exit non-zero with "no checks reported". That is **not** a failure — do not wait for checks and do not treat it as a blocker. State in the PR body that CI validated this exact tree on the Phase 2 PR, with a link.

2. **Never pass `--delete-branch`.** The head branch here is `develop`. Deleting it destroys the integration branch.

Validate and merge:

```bash
gh pr view <n> --json state,isDraft,mergeable,mergeStateStatus,baseRefName,headRefName,url
gh pr merge <n> --merge
```

If `mergeable` is `CONFLICTING`, abort and report which paths conflict. This means `main` diverged on files `develop` also touched — resolving it needs a `main` → `develop` back-merge on a branch, reviewed on its own. Do not resolve conflicts inside a release.

### Phase 5 — Tag and GitHub Release

```bash
git checkout main && git pull --ff-only origin main
git tag -a web-v0.2.0 -m "web v0.2.0"
git push origin web-v0.2.0
gh release create web-v0.2.0 --title "web v0.2.0" --notes "<that app's CHANGELOG section>"
```

- Annotated tags only (`-a`), one per released app, created on the merge commit now at `main`.
- For a multi-app release, add `--latest=false` to every release after the first so the "Latest" badge doesn't flip arbitrarily.
- Return the local checkout to `develop` when done.

**Final report** — PR links, tag/Release links, and one line: *"Netlify is building `main` now; confirm the deploy in the Netlify dashboard."* Nothing stronger than that.

---

## Safety rules

- **Never** `git push --force` or `--force-with-lease`, on any branch, at any phase.
- **Never** delete `develop`. No `--delete-branch` on the `main` PR.
- **Never** bypass failing CI in Phase 2.
- **Never** skip the Phase 3 confirmation.
- **Never** claim the production deploy succeeded. Report up to the `main` merge and stop.
- **Never** rewrite or move an existing tag. If a version was already tagged, bump again instead.

## Rollback

Do not force-push `main` and do not delete the tag — the tag is a truthful record of what shipped.

```bash
gh pr create --base main --head revert/web-v0.2.0 --title "revert: web v0.2.0"
```

Revert the promotion merge commit on a branch off `main`, open a PR, merge it. Netlify redeploys from the reverted `main`.

Then **revert the revert on `develop`** — or rather, do not back-merge the revert into `develop`, since that would undo the work there too. Fix the underlying problem on `develop` and release again. The revert commit stays a `main`-only commit and will show up in Phase 0's drift list; that is expected and benign.

## Related skills

- `github-pr-creator` — PR body/label conventions reused by both PRs
- `github-pr-merger` — the pre-merge validation checklist reused in Phase 4
- `git-rebase-helper` — for the `main` → `develop` back-merge Phase 0 may recommend
- `commit-helper` — Conventional Commits format for the release commit

## Follow-up note

The unmerged branch `origin/ci/web-netlify-deploy` adds `.github/workflows/deploy.yml`, which deploys web to Netlify on `main` push via `netlify-cli` and reports to Slack. If that lands, the deploy becomes an observable GitHub Actions run (`gh run watch`), and a deploy-verification phase becomes worth adding here. Until then, deploy verification stays out of scope.

---

## Example Interaction

**User**: "배포해줘"

**Assistant**:
"Preflight:
- Working tree clean ✅
- `main..develop`: 49 commits ✅
- Hotfix drift: 2 commits, both known-benign legacy (`df4e59d` ads.txt already on both, `db7df45` from 2025-11) — no pending hotfix ✅
- No release PR in flight ✅

Release scope:

```
app     current → proposed   basis
web     0.1.0   → 0.2.0      24 commits: feat 6, fix 5, refactor 4, chore 7, perf 1, docs 1   (first release)
admin   0.0.0   → 0.1.0      5 commits: feat 1, fix 1, chore 3                                (first release)
```

Both get a minor bump — `feat` commits present, no `BREAKING CHANGE`. Proceed, or override either version?"

**User**: "진행해"

**Assistant**:
"Created `chore/release-web-0.2.0-admin-0.1.0`: bumped `apps/web/package.json` to `0.2.0` and `apps/admin/package.json` to `0.1.0`, wrote both CHANGELOGs. `pnpm-lock.yaml` untouched as expected. PR #263 open against `develop`, waiting on CI…

CI green (typecheck + lint). Merged #263 into `develop`, branch deleted.

Ready to promote. This merges `develop` → `main`, which deploys to production.

- web `0.1.0` → `0.2.0` (24 commits), admin `0.0.0` → `0.1.0` (5 commits)
- CHANGELOG: 7 features, 6 fixes, 19 other

Confirm production release?"
