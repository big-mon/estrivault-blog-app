---
title: Claude CodeにHooksを導入してPrettierを自動実行する
description: Claude CodeのHooks機能を使って、ファイル編集後に自動的にPrettierを実行する方法を解説します。PostToolUseフックを活用してコードフォーマットを自動化しましょう。
slug: claude-code-hooks-prettier
publishedAt: 2025-07-08T01:30:00
coverImage: /Hero/vsdxspfklceee649bno4
category: Tech
tags: ['AI', 'Claude Code', 'Hooks', 'Prettier', '自動化']
---

AnthropicはClaude Codeに**Hooks**という機能拡張を行っています。HooksはLLM自身の判断に左右されず、特定のアクションを常に自動実行するよう強制できる仕組みです。公式の使用例にも上がっていますがprettierを自動実行するなど便利そうです。メモリーに記憶させても無視されがちだったのでありがたいですよね。

https://docs.anthropic.com/en/docs/claude-code/hooks

:::warn
便利な機能ではありますが、常に特定のシェルコマンドを実行するということはユーザー自身が内容を分かっていないHooksを設定することは非常に危険ということでもあります。Hooksに設定するコマンドは自分自身で意図を理解した内容に留めましょう。
:::

## さっそくHooksを設定する

公式ドキュメントに記載がありますがHooksを設定する方法はいくつかあります。

```bash
/hooks
```

標準コマンドである`/hooks`を使用することでどんな種類のHookを作成するかを選べます。

- PreToolUse
- PostToolUse
- Notification
- Stop
- SubagentStop

今回はToolの実行後にPrettierを適用してほしいので`PostToolUse`を選びます。

### matcherを選択する(Add new matcher for PostToolUse)

PostToolUseでタイミングを選択したので、次はmatcherとしてどのツールを使用した後に呼び出したいのかを決定していきます。

Claude Codeがファイル編集をした後に実行したいので`Write|Edit|MultiEdit`を入力します。`|`で複数のツールを指定できるようです。`Web.*`のように正規表現での指定もできます。

### 実行するコマンドを決定する

いよいよ指定したタイミングでどんなコマンドを実行するかを決定します。ここまでの入力時にもClaude Codeは何度も警告してきていますが、ユーザーの権限でここで決定するコマンドは実行されるので、不用意なコマンドは設定しないようにしましょう。今回はPrettierの実行です。

本来はHooksにはJSON形式でコマンドを与えてある程度複雑な処理を行うため、コマンドライン上でJSONを扱えるようにする`jq`コマンドを利用可能とする必要があるのですが、Prettierの実行コマンドを既に`pnpm format`として定義済みだったので`jq`コマンドは不要でした。

コマンドを決定したらプロジェクト設定やユーザー設定のどこに保存するかを選択しましょう。

選んだ保存先に下記の様にHooksが登録されているはずです。

```json:.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm format"
          }
        ]
      }
    ]
  }
}
```

### hooksの実行ログを確認してみる

対象のツールの実行が終了した場面で`Ctrl + R`を入力することで折りたたまれていた実行ログを展開することができます。

今回はWriteツールの実行後にログを開いてみることで、Hooksがちゃんと実行されたのかどうかを確かめてみます。

```bash
● わざと形を崩したファイル編集を行って、Prettierが自動実行されるかテストしてみます：

● Write(/workspaces/test-wsl-version/test-prettier.js)
  ⎿  Wrote 12 lines to /workspaces/test-wsl-version/test-prettier.js
     // わざと形を崩したJavaScriptファイル
     const    test   =   {
       name:     "test",
     age:25,
       city   :"Tokyo"
     };

     function   badlyFormatted( param1,param2 ){
     return param1+param2;
     }

     const array=[1,2,3,4,5];
Running PostToolUse:Write...
PostToolUse:Write [pnpm format] completed successfully: > xxxxx
> prettier --write .
```

`PostToolUse:Write [pnpm format] completed successfully`と出力されて、想定したHooksにて想定したコマンドが実行されて成功していることが確認できました。

## とはいえ、Prettierを実行したいだけなら

この記事ではPrettierを強制して実行することを目標にHooksを設定してみましたが、手動での作業時にもPrettierは変わらず実行したいものなので、Hooksだけに設定してしまうのは片手落ちです。

`husky`などを導入してpre-commitとしてPrettierの実行を強制する方が現実的かもしれませんね。
