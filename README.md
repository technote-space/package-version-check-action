# Package Version Check Action

[![Build Status](https://github.com/technote-space/package-version-check-action/workflows/Build/badge.svg)](https://github.com/technote-space/package-version-check-action/actions)
[![codecov](https://codecov.io/gh/technote-space/package-version-check-action/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/package-version-check-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/package-version-check-action/badge)](https://www.codefactor.io/repository/github/technote-space/package-version-check-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/package-version-check-action/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Action to check package version before publish.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Screenshots](#screenshots)
- [Installation](#installation)
  - [Used when push](#used-when-push)
  - [Used in the release process](#used-in-the-release-process)
- [Options](#options)
  - [BRANCH_PREFIX](#branch_prefix)
  - [COMMIT_DISABLED](#commit_disabled)
  - [COMMIT_MESSAGE](#commit_message)
  - [PACKAGE_NAME](#package_name)
  - [PACKAGE_DIR](#package_dir)
  - [TEST_TAG_PREFIX](#test_tag_prefix)
- [Action event details](#action-event-details)
  - [Target events](#target-events)
- [Motivation](#motivation)
- [Addition](#addition)
  - [Commit](#commit)
  - [Tags](#tags)
- [Sample repositories using this Action](#sample-repositories-using-this-action)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshots
1. Running `GitHub Action`  

   ![Running](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-1.png)

1. Updated version of package.json and commit (if branch is not protected)  

   ![Updated](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-2.png)

## Installation
### Used when push
   e.g. `.github/workflows/check_version.yml`
   ```yaml
   on: push
   name: Check package version
   jobs:
     checkVersion:
       name: Check package version
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v1
           with:
             fetch-depth: 3

         # Use this GitHub Action
         - name: Check package version
           uses: technote-space/package-version-check-action@v1
           with:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             BRANCH_PREFIX: release/
   ```

### Used in the release process
   e.g. `.github/workflows/release.yml`
   ```yaml
   on:
     push:
       tags:
         - 'v*'
   name: Publish Package
   jobs:
     release:
       name: Publish Package
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@master
           with:
             fetch-depth: 3

         # Use this GitHub Action
         - name: Check package version
           uses: technote-space/package-version-check-action@v1
           with:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

         - name: Install Package dependencies
           run: yarn install
         - name: Build
           run: yarn build
         - name: Publish
           uses: actions/npm@master
           env:
             NPM_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
           with:
             args: publish
   ```

## Options
### BRANCH_PREFIX
Branch name prefix.  
default: `''`  
e.g. `release/`

### COMMIT_DISABLED
Whether commit is disabled.  
default: `''`

### COMMIT_MESSAGE
Commit message of update package version commit.  
default: `'feat: Update package version'`

### PACKAGE_NAME
Package file name.  
default: `'package.json'`

### PACKAGE_DIR
Package directory.  
default: `''`

### TEST_TAG_PREFIX
Prefix for test tag.  
default: `''`  
e.g. `'test/'`

## Action event details
### Target events
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|release: published|[condition1](#condition1)|
|release: rerequested|[condition1](#condition1)|
|created: *|[condition2](#condition2)|
### Conditions
#### condition1
- tags
  - semantic versioning tag (e.g. `v1.2.3`)
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (e.g. `v1.2.3`)
    - e.g. branch: `release/v1.2.3`
#### condition2
- tags
  - semantic versioning tag (e.g. `v1.2.3`)

## Motivation
If you forget to update the package.json version, publishing the npm package will fail.  

![Failed](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-4.png)

If you are invoking an action by pushing a tag, you have to do following steps again.

1. Delete pushed tag
1. Update package.json version
1. Commit and tag again
1. Push

This is very troublesome.

This `GitHub Action` updates the version in package.json based on the tag name automatically.  
So you don't have to worry about the version in package.json.  

This action also commits the change if the branch is not protected.  
If the branch is protected, this action just update the version in package.json.  

![Not commit](https://raw.githubusercontent.com/technote-space/package-version-check-action/images/screenshot-3.png)

## Addition
### Commit
Commit is valid when pushing to `default branch with tag` or `branch starting with ${BRANCH_PREFIX}`.

### Tags 
Tag name format must be [Semantic Versioning](https://semver.org/).  

## Sample repositories using this Action
- [GitHub Action Helper](https://github.com/technote-space/github-action-helper)
  - [check_version.yml](https://github.com/technote-space/github-action-helper/blob/master/.github/workflows/check_version.yml)
- [GitHub Action Config Helper](https://github.com/technote-space/github-action-config-helper)
  - [check_version.yml](https://github.com/technote-space/github-action-config-helper/blob/master/.github/workflows/check_version.yml)
- [GitHub Action Test Helper](https://github.com/technote-space/github-action-test-helper)
  - [check_version.yml](https://github.com/technote-space/github-action-test-helper/blob/master/.github/workflows/check_version.yml)
- [Filter GitHub Action](https://github.com/technote-space/filter-github-action)
  - [check_version.yml](https://github.com/technote-space/filter-github-action/blob/master/.github/workflows/check_version.yml)
- [jQuery Marker Animation](https://github.com/technote-space/jquery.marker-animation)
  - [check_version.yml](https://github.com/technote-space/jquery.marker-animation/blob/master/.github/workflows/check_version.yml)
- [Gutenberg Utils](https://github.com/technote-space/gutenberg-utils)
  - [check_version.yml](https://github.com/technote-space/gutenberg-utils/blob/master/.github/workflows/check_version.yml)
- [Register Grouped Format Type](https://github.com/technote-space/register-grouped-format-type)
  - [check_version.yml](https://github.com/technote-space/register-grouped-format-type/blob/master/.github/workflows/check_version.yml)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
