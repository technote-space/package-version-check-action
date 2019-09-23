# Package Version Checker

[![Build Status](https://github.com/technote-space/ga-package-version-checker/workflows/Build/badge.svg)](https://github.com/technote-space/ga-package-version-checker/actions)
[![Coverage Status](https://coveralls.io/repos/github/technote-space/ga-package-version-checker/badge.svg?branch=master)](https://coveralls.io/github/technote-space/ga-package-version-checker?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/ga-package-version-checker/badge)](https://www.codefactor.io/repository/github/technote-space/ga-package-version-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/ga-package-version-checker/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

パッケージ公開前にパッケージのバージョンをチェックする GitHub Action

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [スクリーンショット](#%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88)
- [インストール](#%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
- [オプション](#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)
  - [COMMIT_DISABLED](#commit_disabled)
  - [COMMIT_MESSAGE](#commit_message)
  - [PACKAGE_NAME](#package_name)
  - [PACKAGE_DIR](#package_dir)
  - [TEST_TAG_PREFIX](#test_tag_prefix)
- [補足](#%E8%A3%9C%E8%B6%B3)
  - [コミット](#%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88)
  - [Tags](#tags)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## スクリーンショット
1. `GitHub Action` 実行中  
   ![Running](https://raw.githubusercontent.com/technote-space/ga-package-version-checker/images/screenshot-1.png)
1. package.json のバージョンを更新  
   ![Updated](https://raw.githubusercontent.com/technote-space/ga-package-version-checker/images/screenshot-2.png)

## インストール
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

## オプション
### COMMIT_DISABLED
コミットが無効かどうか  
default: `''`

### COMMIT_MESSAGE
パッケージバージョン更新用コミットのメッセージ  
default: `'feat: Update package version'`

### PACKAGE_NAME
パッケージファイル名  
default: `'package.json'`

### PACKAGE_DIR
パッケージファイルが置かれたディレクトリ  
default: `''`

### TEST_TAG_PREFIX
テスト用タグのプリフィックス  
default: `''`  
例：`'test/'`

## Action イベント詳細
### 対象イベント
- push: *
  - tags
    - semantic versioning tag (例：`v1.2.3`)

## 補足
### コミット
コミットはデフォルトブランチへのプッシュ時のみ有効です。

### Tags
タグ名は [Semantic Versioning](https://semver.org/) に従っている必要があります。  
以下のタグが作成されます。
- 指定されたタグ名
- メジャーバージョンのタグ名 (指定されたタグ名から生成)
  - 例：`v1`
- マイナーバージョンのタグ名 (指定されたタグ名から生成)
  - 例：`v1.2`

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
