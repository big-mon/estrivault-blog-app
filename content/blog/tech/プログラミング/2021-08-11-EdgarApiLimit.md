---
title: EDGARのAPIで「Undeclared Automated Tool」が発生する場合の解決法
description: EDGAR API「Undeclared Automated Tool」エラーの解決方法。User-Agentヘッダーの設定不備が原因でAPIコール制限される問題と、正しいリクエストヘッダーの設定手順を解説。
slug: edgar-api-limit
publishedAt: 2021-08-11T18:24:00
coverImage: /Hero/pexels-thisisengineering-3861967.jpg
category: Tech
tags: ['プログラミング', 'EDGAR']
---

EDGARで公開されている便利なAPIを[過去記事](/tags/edgar/)にて紹介してきました。

しかしいざAPIをコールしてみると初回からリミットエラーが発生することがあります。ブラウザからURLを直接参照した場合は正しくデータが返却されるのに、なぜでしょうか？

今回はその解決法を記載します。

## EDGARのAPIコール時にエラーが発生

> Your Request Originates from an Undeclared Automated Tool
>
> To allow for equitable access to all users, SEC reserves the right to limit requests originating from undeclared automated tools. Your request has been identified as part of a network of automated tools outside of the acceptable policy and will be managed until action is taken to declare your traffic.

自作したプログラムなどからAPIをコールすると上記のようなエラーが発生することがあります。これは簡単に言えば「**不明な自動化ツールからのAPI利用は制限しています**」という内容のエラーです。

### EDGARのAPI制限事項

EDGARはシステムの過剰な負荷を回避するため、API利用者に対していくつかの[制限事項](https://www.sec.gov/os/accessing-edgar-data)を設けています。上述したエラーはその制限事項に準拠していないため発生したエラーです。

1. APIのコール頻度：**10 回/秒**までのAPIコール頻度に抑えることが求められています。
1. ユーザーエージェントの明記：APIをコールする際のリクエストのヘッダー部に所定の**User-Agent**(UA)を設定することが求められています。

### 制限事項への対応方法

APIのコール頻度に関しては割愛し、ユーザーエージェントの設定の方法を記載します。JavaScriptを例に記載しますがどのプログラム言語でも大差はありません。

```js
const fetchAPI = (url) =>
  fetch(url, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': '組織名@組織ドメイン',
      'Accept-Encoding': 'gzip, deflate',
      Host: 'www.sec.gov',
    },
  }).then((res) => res.json());
```

フェッチAPIを使用してAPIをコールする場合を想定しています。ヘッダーに「User-Agent」をセットしています。組織名と組織ドメインは自身のものに置換してください。

厳密にはUser-Agentのみを設定すればAPIコールが可能になるはずですが、公式のサンプルヘッダーでAccept-EncodingとHostを設定しているので、サンプルに倣い設定しておくのが吉でしょう。

## まとめ

EDGARのページはどれも似たようなものが多く、どこに何が記載されているのか迷子になってしまいがちですが、しっかりと記載がありました。やはり公式ドキュメントを当たるのが正道ですね。

とはいえ、日本語でサクッと紹介されていればそれはそれで楽で助かるのも事実。この記事が誰かの助けになれば幸いです。

::amazon{asin="B092ZGNKVC" name="え、社内システム全てワンオペしている私を解雇ですか？"}
