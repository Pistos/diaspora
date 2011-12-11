#!/bin/bash

# Exit on any error
set -e

build_from_master=0

if [ -z "$version_root" ]; then
  echo 'Please specify version_root env var.  e.g. export version_root="diasp0ra.ca"  # for a resultant branch like diasp0ra.ca-1.0.0'
  exit 1
fi

if [ ! -s 'branches-to-merge.txt' ]; then
  echo 'Could not read branches-to-merge.txt .  Please list branch names in branches-to-merge.txt .'
  exit 2
fi

while getopts ":m" opt; do
  case $opt in
    m)
      build_from_master=1
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

# Check if working copy is dirty, or there are unstaged changes
git diff-index --quiet HEAD || ( echo 'Working copy is dirty; aborting.' && exit 3 )

if [ "$#" -ne 1 ]; then
  version=`git branch | egrep "${version_root}-[0-9]" | sort | tail -n 1 | ruby -ne 'print $_[/([0-9.]+)$/, 1].succ'`
else
  version=$1
fi

version_branch="${version_root}-${version}"

echo "** Building ${version_branch}"
echo

if [ ${build_from_master} -eq 1 ]; then
  # Freshen from mainline repository (Diaspora core devs)
  git checkout master
  git fetch diaspora
  git merge --ff-only diaspora/master
fi

# Create version branch off master
git checkout -b ${version_branch}

# Merge all branches listed in branches-to-merge.txt
cat branches-to-merge.txt | while read branchname ; do
  echo
  echo "----- Merging: ${branchname}"
  git merge --rerere-autoupdate "${branchname}" \
    || ( git diff --quiet && git commit -m "Merge branch '${branchname}' into ${version_branch}" ) \
    || ( echo && echo '*****************' && echo "Failed to merge ${branchname}; aborting." && exit 4 )
done
