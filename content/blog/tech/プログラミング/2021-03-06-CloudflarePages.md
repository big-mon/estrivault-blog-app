---
title: Cloudflare PagesでHugoデプロイ時のバージョンを変更する方法
description: Cloudflare PagesでHugoデプロイ時のバージョンエラー解決方法。hugo-theme-janeの古いHugoバージョン対応問題を環境変数HUGO_VERSIONで解決する手順を解説。
slug: cloudflare-hugo-change-version
publishedAt: 2021-03-06T18:05:00
coverImage: /Hero/cloudflare-logo_f10qrs.jpg
category: Tech
tags: ['プログラミング', 'NET', 'JAMstack']
---

# はじめに

みんな大好きCloudflareの「**Cloudflare Pages**」をようやく使用できました。

JAMstackの中の注目株「Hugo」で作成したプロジェクトのデプロイを試してみましたが、躓きがあったのでその解決方法を記しておきます。

## 余談

2020年12月17日にサービスが発表され、即座にBetaへ申し込んだのですが個人の細々としたブログ用途という事もあってか、待ちに待たされ2021年3月6日に晴れてアクセス権が付与されました。CDNは速いけど、サービス提供の範囲拡大は遅いね！へへっ。

Cloudflare PagesはJAMstack向けのホスティングサービスです。競合サービスとしてVercelやNetlifyが挙げられます。使用経験はVercelとNetlifyのどちらもありますが、私は運営しているJAMstackをどれも Vercelにてホスティングしています。

# 躓いたこと

Vercelにてホスティングして動作しているプロジェクトをCloudflare Pagesにてデプロイしようとしたところ、**エラーが発生してデプロイに失敗**しました。

- プラットフォーム：Hugo
  - テーマ：hugo-theme-jane
- ビルドコマンド：hugo
- デプロイディレクトリ：public

> Error: Error building site: failed to render pages: render of "XXXXX" failed: "/opt/buildhome/repo/themes/jane/layouts/rss.xml:4:19": execute of template failed: template: rss.xml:4:19: executing "rss.xml" at <.Site.Config.Service...>: can't evaluate field RSS in type services.Config

Vercelではビルド成功しているのに・・・、なぜ？

## 原因

ビルドに使用している**Hugoのバージョンが古い**。

使用しているテーマの[イシュー](https://github.com/xianmin/hugo-theme-jane/issues/188)に、Hugoのバージョンが低い場合に同様のエラーが発生することが記載されていました。

Cloudflare Pagesでのログを確認してみると、`Hugo Static Site Generator v0.54.0`との出力がありました。上述したイシューでは`v0.55.4`以上を用いることで解決するとされているので、恐らく確定でしょう。

## 解決策

Cloudflare Pagesが**Hugoのビルドに使用するバージョンを上げることで解決**できます。

その方法は**環境変数の指定**です。

「設定 > 環境変数」にあるプロダクションとプレビューのそれぞれに`HUGO_VERSION = 0.80.0`を指定します。(バージョンは適当なので適宜読み替え)

再デプロイを試みると、使用されるHugoのバージョンが環境変数で指定したものに代わり、無事にデプロイが成功するようになりました。

::amazon{asin="4297119250" name="Web配信の技術―HTTPキャッシュ・リバースプロキシ・CDNを活用する"}
