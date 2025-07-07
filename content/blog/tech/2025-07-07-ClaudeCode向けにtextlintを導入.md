---
title: Claude Code向けにtextlintをMCPで導入する
description: textlint-rule-preset-ai-writingを使ってAI生成文章の機械的な表現を検出・改善し、より自然で読みやすいブログ記事を作成する方法をClaude Codeベースで解説します。
slug: claude-code-textlint-ai-writing-improvement
publishedAt: 2025-07-08T00:00:00
coverImage: /Hero/k9yxpyjymggxiqj9rrhy
category: Tech
tags: ['textlint', 'AI', 'Claude Code', '文書校正']
---

AIが生成した文章によく見られる記述パターンを検出して、いわゆる自動生成臭を消せる文書校正ルールセット「textlint-rule-preset-ai-writing」が登場したのでブログシステムに取り組んでみました。確かにAIが記述した文章はある一定の"それっぽさ"があり、人によってはそれだけで読む気をなくすかもしれません。

AIがある程度サポートして書いた文章だからといって、それだけで読まれなくなってしまうとちょっと悲しいものです。このルールセットがどこまで有効なのかは分かりませんが、物は試しと導入してみましょう。

https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing

この記事で導入手順を記載するのは**Claude Code**をベースとしています。

## 実際に導入してみる

まずは実際の依存をインストールします。

```bash
pnpm add -D -w textlint @textlint-ja/textlint-rule-preset-ai-writing
pnpm install
```

`pnpm`を使用しており、`textlint`本体と本命のルールセットである`textlint-rule-preset-ai-writing`を同時にインストールしています。

対象のブログシステムがモノレポ構成のため`-w`オプションをつけていますが、プロジェクトによって選んでください。通常は校正は開発中だけで良いので`-D`オプションで開発用の依存としています。

```json:.textlintrrc.json
{
  "plugins": ["@textlint/markdown"],
  "rules": {
    "@textlint-ja/textlint-rule-preset-ai-writing": true
  }
}
```

`.textlintrrc.json`にtextlintで使用するルールセットとして`textlint-rule-preset-ai-writing`を有効にします。今回はデフォルト設定のまま試したいので、特にいじらずにおきます。

### MCPも併せて導入する

せっかくなのでMCPで導入してみます。AI自身がAI臭さを消せるように環境を整えるのはなかなか皮肉が効いているようです。

```bash
claude mcp add textlint -s project -- npx textlint --mcp
```

- claude mcp add： Claude MCPサーバーに新しいツールを追加
- textlint： 追加するサーバーの名前
- -s project： プロジェクトスコープで追加（そのプロジェクトでのみ利用可能）
- -- npx textlint --mcp： 実際に実行されるコマンド

Claude CodeにはMCPを導入するコマンドが整備されているので、上記コマンドを実行します。すると自動で`.mcp.json`が作成され、MCPの導入が完了します。

手順としては簡単ですがこれで終わりです。

### Claude CodeにAI臭さを消させてみる

```bash
xxxxx.mdをtextlintして
```

これだけで通じます。それなりに指摘が出てくるので、細かくルールを調整していく必要がありますが、そのあたりもAIに良しなにやってもらうのが今のAI時代のスタンダードかもしれませんね。(私が適当にオーダーしたら支離滅裂なルールセットになったので人間の監督はまだまだ必要だなと思いましたが)
