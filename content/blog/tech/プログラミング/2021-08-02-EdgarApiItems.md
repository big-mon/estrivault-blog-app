---
title: EDGARからデータ取得：APIで複数年度の純利益を取得
description: 任意の決算項目を複数年度分取得する
slug: edgar-api-items
publishedAt: 2021-08-02T02:15:00
coverImage: /Hero/pexels-photomix-company-95916.jpg
category: Tech
tags: ['プログラミング', 'EDGAR']
---

EDGARが公開しているAPIを使用して、任意の企業が過去に決算報告した情報を取得することができます。今回はそのAPIを使用して複数年度にまたがる純利益などの情報を取得する方法を紹介します。

# EDGARのAPI

先日β版ではありますがEDGARがAPIの公開を始めました。これは画期的なことです。今まではシステマティックにデータを読み取るためにはXBRLをダウンロードして自分で解析するソフトウェアを使用する必要がありましたが、例えば売上高の推移を知りたいといった簡易的な用途であればAPIを使用するだけで済んでしまうのです。

下記に[EDGARのAPIに関するリファレンスページ](https://www.sec.gov/edgar/sec-api-documentation)へのリンクを記載しています。本記事に紹介されていない詳細な情報や詳しい利用規約などはリファレンスページから参照するようにお願いします。

> [EDGAR APIs—now available for beta testing](https://www.sec.gov/edgar/sec-api-documentation)

現在のところAPIが対象としている書式(Form)は10-Q, 10-K, 8-K, 20-F, 40-F, 6-Kとそれらの変形(修正など)です。これら以外の書式を必要とする場合は従来通りの方法が必要となります。β版のため予告なく記事の内容とAPI仕様が変わる可能性がある点に留意ください。

## data.sec.gov/submissions/

対象となる企業のファイリング履歴を確認できるAPIです。

`##########`は10桁の先頭0埋めを行ったCIKを代入して使用します。AAPLの場合は`https://data.sec.gov/submissions/CIK0000320193.json`となります。

> https://data.sec.gov/submissions/CIK##########.json

ティッカーシンボルや会社名、取引所などのメタデータの他に少なくとも過去1年間もしくは1000件のファイリング履歴が取得できます。どの開示資料がいつ開示されたのかなどを調べる際に利用できそうです。また XBRLに対応しているのか、それはインラインXBRLなのかといった真偽値も保持しており、主体となるインスタンスのファイル名なども取得できます。

## data.sec.gov/api/xbrl/companyconcepts/

対象となる企業の特定の項目に関する過去の開示データを取得する API です。

- `us-gaap`の他に`ifrs-full`や`dei`や`srt`が使用できます。
  - us-gaap：会計情報
  - dei：Document and Entity Information、文書に関する情報や株式数の情報など
- `AccountsPayableCurrent`はXBRL上のラベル名です。この場合は純利益となります。

> https://data.sec.gov/api/xbrl/companyconcept/CIK##########/us-gaap/AccountsPayableCurrent.json

## data.sec.gov/api/xbrl/companyfacts/

上述した`companyconcepts`の情報をすべて1度に取得するAPIです。

> https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json

全てのデータが1度にまとめて出力されるためかなりレスポンスが遅いAPIです。なるべく取得する項目を絞って`companyconcepts`を利用した方が良いでしょう。

## data.sec.gov/api/xbrl/frames/

指定期間内の開示書類を全て取得するAPIです。

- CY2019Q1I：対象とする期間を指定します。年次データは`CY####`、四半期データは`CY####Q#`、瞬間的なデータが必要な場合は`CY####Q#I`とします。期間の計算はうまいことEDGARがやってくれるそうですが、詳しくはブラックボックスなので異なる値となる可能性があります。

> https://data.sec.gov/api/xbrl/frames/us-gaap/AccountsPayableCurrent/USD/CY2019Q1I.json

任意の項目を全企業で横並びに確認したい場合などに使用できそうです。

# まとめ

AAPLの純利益を過去年度にわたって取得したい場合、`https://data.sec.gov/api/xbrl/companyconcept/CIK0000320193/us-gaap/AccountsPayableCurrent.json`をコールすることで簡単に取得できます。

肝心の[CIKを調べる方法](./how-to-get-ticker-and-cik-from-edgar)は別途記事を公開しているのでご参照ください。

```amazon:4495210262
市場の守り人―証券取引等監視委員会の使命
```
