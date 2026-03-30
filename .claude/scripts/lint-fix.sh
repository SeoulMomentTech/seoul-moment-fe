#!/bin/bash

# Run the lint:fix:all script via pnpm, redirecting stdout and stderr to stderr
# so that the output does not interfere with the JSON response expected by Gemini CLI.
pnpm run lint:fix:all >&2

# Output the required JSON decision to stdout
echo '{"decision": "allow"}'
