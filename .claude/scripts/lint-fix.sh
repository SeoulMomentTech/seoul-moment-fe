#!/bin/bash

# Run the lint:fix:all script via pnpm, redirecting stdout to stderr
# so that the output does not interfere with the JSON response.
pnpm run lint:fix:all >&2

# Output valid JSON for Claude Code hooks (suppress lint output from transcript)
echo '{"suppressOutput": true}'
