#!/bin/bash
set -e
npm install -g npm

npm ci

# Set the version to the release version
npm --no-git-tag-version version "$1"

npm run build

npm publish