#!/bin/bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

cd "$REPO_ROOT"

echo "[codex-hook] running pnpm run lint:fix:all" >&2
pnpm run lint:fix:all >&2

echo '{"continue":true}'
