---
title: EDGARからデータ取得：ティッカーとCIKの関連を割り出す
description: EDGARシステムでティッカーとCIKの関連を調べる方法。company_tickers.jsonを使用した企業検索、Form 10-K/10-QなどのXBRL形式決算データ取得の基礎知識を解説。
slug: how-to-get-ticker-and-cik-from-edgar
publishedAt: 2021-08-01T02:15:00
coverImage: /Hero/pexels-photomix-company-95916.jpg
category: Tech
tags: ['プログラミング', 'EDGAR']
---

**EDGAR**を知っているでしょうか？

EDGARはSEC(米国証券取引委員会)へ提出が義務付けられている書類データを取り扱う公的なシステムの名称です。1996年以降から原則としてアメリカ国内の全ての公開会社の開示書類が公開されています。

前述したように開示書類が原則すべて公開されているため、**企業の決算情報なども一次情報としてEDGARから取得可能**です。長くなるため複数の記事に分割し最終的にEDGARからForm 10-Kを取得することを目指します。

今回は「目当ての企業のティッカーと取引所をEDGARから取得する方法」をまとめてみたいと思います。

# EDGARのデータ開示

前提としてEDGARから取得できるデータは「XBRL」という財務諸表などの国際規格に従った形式です。(別途[XBRLについてまとめた記事](./what-is-xbrl)を作成しているので参照ください)

| Form   | 概要               |
| ------ | ------------------ |
| 10-K   | 年次報告書         |
| 10-K/A | 年次報告書の修正   |
| 10-Q   | 四半期報告書       |
| 10-Q/A | 四半期報告書の修正 |

代表的な上記を覚えておけば良いでしょう。末尾の「/A」は修正を意味しています。その他の書類についてはEDGARを[参照](https://www.sec.gov/oiea/Article/edgarguide.html)してください。

> 参考：[Accessing EDGAR Data](https://www.sec.gov/os/accessing-edgar-data)

## 企業とCIKの紐づけ

EDGARでは「**CIK**」(Central Index Key)という一意の識別子があり、よく登場します。CIKはSECへ企業が書類を提出するためのサインアップ時に割り当てられるもので、企業ごとに固有です。

CIKとティッカーと企業名がEDGAR上でどのように関連付けられているかは下記の公開ファイルにて確認が可能です。定期的に更新がアナウンスされていますが、正確性や範囲が保証されたものではない点に留意が必要です。

| ファイル                                                                                 | 情報                          |
| ---------------------------------------------------------------------------------------- | ----------------------------- |
| [company_tickers.json](https://www.sec.gov/files/company_tickers.json)                   | CIK, ティッカー, 会社名       |
| [company_tickers_exchange.json](https://www.sec.gov/files/company_tickers_exchange.json) | CIK, ティッカー,会社名,取引所 |

#### AAPLのCIKを調べてみる

例としてAppleを `company_tickers_exchange.json`で確認してみます。

```json
{
  "fields": ["cik", "name", "ticker", "exchange"],
  "data": [
    [320193, "Apple Inc.", "AAPL", "Nasdaq"],
    ...
  ]
}
```

| CIK    | 会社名     | ティッカー | 取引所 |
| ------ | ---------- | ---------- | ------ |
| 320193 | Apple Inc. | AAPL       | Nasdaq |

上記の情報でEDGARに認識されていることが分かります。

##### CIKの注意点

なお後述するEDGARのAPIでCIKを用いる場合、10桁の0埋めが必要です。AAPLの場合は「0000320193」となります。

## まとめ

`company_tickers_exchange.json`を使うことで、各企業のティッカーと上場している取引所が割り出せるようになりました。

ティッカーは基本的に重複しないため「ティッカーからCIK」もしくは「CIKからティッカー」のどちらもがこのJSONを使うことで割り出しが可能となります。

::amazon{asin="4495210262" name="市場の守り人―証券取引等監視委員会の使命"}
