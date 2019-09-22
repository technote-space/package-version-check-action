# Package Version Checker

[![Build Status](https://github.com/technote-space/ga-package-version-checker/workflows/Build/badge.svg)](https://github.com/technote-space/ga-package-version-checker/actions)
[![Coverage Status](https://coveralls.io/repos/github/technote-space/ga-package-version-checker/badge.svg?branch=master)](https://coveralls.io/github/technote-space/ga-package-version-checker?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/ga-package-version-checker/badge)](https://www.codefactor.io/repository/github/technote-space/ga-package-version-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/ga-package-version-checker/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

GitHub Action to check package version before publish.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Screenshots](#screenshots)
- [Installation](#installation)
- [Options](#options)
  - [COMMIT_MESSAGE](#commit_message)
  - [PACKAGE_NAME](#package_name)
  - [PACKAGE_DIR](#package_dir)
  - [TEST_TAG_PREFIX](#test_tag_prefix)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Screenshots

## Installation
1. Setup workflow
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
           uses: technote-space/ga-package-version-checker@v1
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

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
