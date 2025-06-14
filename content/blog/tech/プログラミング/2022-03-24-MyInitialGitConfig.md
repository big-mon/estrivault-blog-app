---
title: OSクリーンインストール後の開発環境の初期設定(Git)
description: Gitの初期設定など個人メモ
slug: my-initial-git-config
publishedAt: 2022-03-24T17:42:00
coverImage: /Hero/pexels-josh-sorenson-1714208
category: Tech
tags: ['プログラミング']
---

私はPCゲーマーということもあり主力マシンのOSはWindowsです。Windows 11はリリース当初こそAMDのCPUにとって不利なバグが発見されたりと恒例の人柱状態でしたが、致命的なバグはだいぶ修正されてきたということでまだ一部バグが残存していますが主力マシンをWindows 11にアップグレードしました。

OSをクリーンインストールするのが信条なので開発環境も入れ直したのですが、Gitの設定など最初のセットアップについてド忘れしていたので、またいつかのために手順と設定をメモしておきます。

# 開発環境のセットアップ

- VSCodeのインストール
- Node.jsのインストール
- yarnのインストール
- Gitのインストール
  - Gitの設定

## VSCodeのインストール

ご存じVisual Studio Codeをインストールします。

MSアカウントかGitHubアカウントに一度紐づけておけば、再インストールしても環境設定を引き継げるので何も考えずアカウント連携をしておしまいです。

## Node.jsのインストール

自身のブログテンプレートの更新などWeb開発時にほぼ毎回Nodeを利用するのでインストールします。パッケージマネージャーのyarnの前提ともなっているので必須です。

バージョン制約のきつい開発は行っていないので、その時々のLTSをインストールします。LTSは長期安定板の意味です。

公式サイトにアクセスし、インストールexeをDLしてデフォルト設定のまま実行します。

```bash
# Node.jsのインストール確認(バージョン確認)
node -v
```

## yarnのインストール

```bash
# yarnのインストール(グローバル)
npm install -g yarn

# yarnのインストール確認(バージョン)
yarn -v
```

## Gitのインストール

Git for Windowsをインストールします。設定はデフォルトでインストールします。

### Gitの設定

```bash
git config --global user.name "NAME"
git config --global user.email email@example.com
git config --global pull.ff only
git config --global core.autocrlf input
git config --global core.ignorecase false
git config --global core.quotepath false
git config --global credential.helper wincred
git config --global init.defaultBranch main
```

| 設定               | 内容                             |
| ------------------ | -------------------------------- |
| user.name          | ユーザー名                       |
| user.email         | メールアドレス                   |
| pull.ff            | merge commitの作成条件           |
| core.autocrlf      | 改行コードの自動変換             |
| core.ignorecase    | ファイル名の大文字小文字の区別   |
| core.quotepath     | 日本語ファイル名のエンコード表示 |
| credential.helper  | 認証情報の参照先                 |
| init.defaultBranch | デフォルトブランチ名             |

::amazon{asin="B07BRTBRXV" name="Denon AH-D1200 ヘッドフォン ハイレゾ対応 密閉ダイナミック型"}
