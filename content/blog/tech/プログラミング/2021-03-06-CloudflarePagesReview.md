---
title: Cloudflare PagesとVercelを比べてみた
description: Cloudflare PagesとVercelに同一アプリケーションをデプロイし比較
slug: cloudflare-vercel-compare
publishedAt: 2021-03-06T19:05:00
coverImage: /Hero/cloudflare-logo_f10qrs.jpg
category: Tech
tags: ['プログラミング', 'NET', 'JAMstack']
---

2021/03/28追記：ネックとしていたCloudflare Pagesのビルド速度が向上し、約50秒にまで短縮されてきました。リダイレクト機能が実装され次第、移行しても良いかもしれません。

# はじめに

JAMstack向けのホスティングサービス「**Cloudflare Pages**」を試しました。

ブログをライブドアブログで運営開始し、その後にWordPressへ移行、その後はHugo+Vercelという軌跡を辿ってきました。同じような軌跡をたどっている人は多いと思います。WordPressからHugoやGatsbyなどへ移行すると、サーバー費用が無くなるのがいいんですよね。

私がHugoへ移行する際にHugoとGatsbyの技術選定もそうですが、ホスティングサービスとしてVercelとNetlifyの比較で多くの調べものをしました。(もちろんどれも実際に後から使ってみましたが)その調べものの中で特に参考になった1つにQiitaの「[VercelとNetlifyの違いが分からなかったので実際に比べてみた。](https://qiita.com/fussy113/items/ba204747e3f0e6c59af0)」という記事があります。

今度は私がちょっと真似して還元する番です。(章立ての完成度も高いのでパクります)

## やったこと

Cloudflare PagesとVercelに同一アプリケーションをデプロイし、下記を比較します。

- ビルド(デプロイ)の速度
- サイト表示の速度
- その他

## 検証するアプリケーションの概要

- Hugoを利用した小規模なブログ
- リポジトリはGitHubにて管理
  - プッシュしたら勝手にデプロイ連携される
- CloudflareもVercelも無料プランでの利用

### ビルド(デプロイ)の速度

数百文字程度が書かれたMarkdownファイルを1つだけ追加した際の結果です。

| サービス         |   結果 |
| ---------------- | -----: |
| Vercel           |  10 秒 |
| Cloudflare Pages | 190 秒 |

**圧倒的な差でVercelが速い**です。

Cloudflare Pagesの場合は毎回ビルド環境の初期化が行われており、そこで3分が消費されていることが原因です。リポジトリのクローン作製は2秒、ビルドは5秒、デプロイは2秒となっています。Vercelは処理時間の内訳が表示されないのでこれらの合計です。恐らくVercelはビルド環境の初期化はしていないようです。

### サイト表示の速度

![VercelとCloudflareの比較](/Tech/vercel-cloudflare-comp_igu0zb.jpg)

WebPageTestのVisual Comparisonを用いて[計測](https://www.webpagetest.org/video/compare.php?tests=210306_AiT5_626c787363a2310dab03224a94bfad2a,210306_AiMM_7c78e20468bc293cdf5f53a2d601dcfe)しました。

どちらもCDNに一家言があり、日本を含めて世界の主要都市は網羅しているため**速度にはあまり差がない**ようです。

### その他

以下は主観による比較で、誤認がある可能性があります。

またCloudflare PagesはBeta版であるため状況が随時変化している可能性があります。

#### Vercel

画面がシンプルで通常はGitHubと紐づけるだけで迷うことがない。

速い。

ビルド時のサーバーにタイムゾーンを環境変数によって指定できないので、Hugoの記事時刻をJST形式で記載する必要がある。(今後も対応予定はないとサポート確認済み)

#### Cloudflare Pages

画面は普通、普段からCloudflareを使用している人は迷わない程度にシンプル。

デプロイに要する時間が遅い、閲覧時の速度はVercelと同等。

ページごとのリダイレクト機能が未対応。ただドキュメントページにて今後対応する予定であろう口ぶりなのと、普通は実装されるので問題ではなさそう。

## まとめ

Cloudflare Pagesがオープンベータであるため仕方がないのですが、実際にリダイレクトなど機能的に見劣る部分があります。

**今のCloudflare Pagesをあえて選択する理由は思い浮かびません**でした。

ただし今後ビルド環境の初期化をスキップできるようになり、Vercelと同等の処理時間となったうえでリダイレクト機能が実装されれば、VercelとCloudflare Pagesのどちらを選んだとしても幸せになれると思います。

特に私の場合はCDNサービスやドメイン管理をCloudlfareで利用しているため、一元管理の意味合いで移行する意欲は強いです。反対に分散の意欲がある場合はVercelを利用することが最善策ではないでしょうか。

::amazon{asin="B07XVR9C7B" name="永世乙女の戦い方"}
