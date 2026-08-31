#!/bin/bash
# Publish local changes to GitHub, which triggers a Netlify deploy.
#
# Usage:
#   ./publish.sh                     -> commits with a timestamped message
#   ./publish.sh "your message here" -> commits with your own message
#
# Safe to run any time: if there's nothing to commit, it just exits.

set -e
cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to publish — working tree is clean."
  exit 0
fi

MSG="${1:-Update site $(date '+%Y-%m-%d %H:%M')}"

git add -A
git commit -m "$MSG"
git push origin main

echo ""
echo "Pushed to GitHub. Netlify will pick this up and deploy automatically —"
echo "usually live within a minute or two."
