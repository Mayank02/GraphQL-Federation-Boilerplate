#!/bin/sh

# see: https://git-scm.com/book/en/v2/Git-Tools-Submodules

git fetch --all --prune --recurse-submodules
git pull --recurse-submodules
git submodule update --remote --rebase
