---
title: WordPressからHugoへの移行
description: WordPressからHugoへの完全移行手順。WordPress to Hugo Exporterでのデータ移行、画像処理、VercelでのホスティングまでSSG移行の実践ガイド。セキュリティと保守性の向上を実現。
slug: wordpress-to-hugo
publishedAt: 2020-12-26
coverImage: /Hero/YS4_5968_69_70-2-3_x9dlrp.jpg
category: Tech
tags: ['プログラミング', 'JAMstack']
---

WordPressにて運営していた趣味サイトを、静的サイトジェネレータ(SSG)のHugoへと移行しました。

今回移行したい趣味サイトは本ブログとは別のサイトで、アクセス数も記事数も何倍も異なります。いきなりこれまでの動的サイトジェネレータからSSGへと移行することは躊躇したため、技術的な試験として本ブログを先行してSSG移行して結果に満足しているため本格移行へ着手することとしました。

下記に簡単に移行を決意した理由を列挙してみます。

- WordPressは動的であるためセキュリティへの気遣いがSSGよりも必要
- 記事更新頻度に対してアップデートやメンテナンスの回数が何倍も多かった
- 古い技術なのでそろそろ新しいものに乗せ換えたかった(好奇心)
- 記事データをMarkdown形式で管理して可搬性を高めたかった
- 有料でレンタルしているサーバーの維持費が無料になる

## WordPressからの移行を決意

SSGとして有名なフレームワークにはGatsbyJSやHugoがあります。それらを[比較した先人たちの記事](https://exlair.net/trend-for-static-site-generator/)が大量にある上にもちろん参考になるので、比較は特に本記事では掘り下げません。どちらも試してみましたがHugoの方が分かりやすかったのでHugoにしました。カスタマイズをがっつりとやるのであればGatsbyJSの方がやりやすいと思います。

結論は私とは真逆ですが、[HugoからGatsbyJSへと乗り換えた先人の記事](https://blog.wadackel.me/2020/hugo-to-gatsby/)が分かりやすいのでお勧めです。

### 移行元となるWordPress環境

- サーバー：[ConoHa VPS](https://px.a8.net/svt/ejp?a8mat=35F6JU+EDZ5UI+50+4YT441) 1GBプラン
- 実行環境：KUSANAGI + Luxeritas
- CMS：WordPress

### 移行先となるブログ環境

- サーバー：Vercel
- CMS：自力

移行後はヘッドレスCMSを利用する手もありますが、Markdownによる可搬性を重視したいことと、移行対象サイトの性質上あまり大きな記事変更などは頻繁に行わないことからCMSを導入する必要はないと判断しました。コード類は上記に記載していませんが、GitHubに保管します。

## 移行手順

いよいよ本題です。

WordPressからHugoへの移行についても[先人の知恵](https://randd.kwappa.net/2020/05/17/migrate-wordpress-to-hugo-and-netlify/)がありますので、基本的にはそれを参考として進めていきます。

大きな流れとしては下記となります。

1. 記事データをWordPressから取得
1. 記事データをHugoのテーマ向けに調整
1. Hugoの設定
1. Vercelでホスティング

### 記事データの取得

WordPressの記事データをHugoで扱いやすい形式で取得するための、まさにそれを目的としたプラグイン「[WordPress to Hugo Exporter](https://github.com/SchumacherFM/wordpress-to-hugo-exporter)」が存在するので、それを利用してデータを取得します。

https://github.com/SchumacherFM/wordpress-to-hugo-exporter

記事数と画像数が多いためかブラウザから実行するとタイムアウトとなってしまうため、サーバーのコマンドラインから直接実行しました。コマンドラインによるエクスポート手順はプラグインの公式手順通りです。

```bash
cd /home/kusanagi/XXXXX/DocumentRoot/wp-content/plugins/wordpress-to-hugo-exporter-master/
php hugo-export-cli.php .
```

`/home/kusanagi/XXXXX/DocumentRoot/wp-content/plugins/wordpress-to-hugo-exporter-master/`に`wp-hugo.zip`が出力されるのでFileZillaなどを使用してローカルへダウンロードします。

### HugoでHTML出力を許可

Hugoは初期設定だと、Markdown内のHTMLをセキュリティ上の観点から出力しません。

今回はソース元が自分自身であり信頼可能のため、この設定を切ります。

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
```

### 画像データを移動

画像フォルダのバックアップを`/static/images`に配置します。

私の環境ではWordPress時代から画像がimagesディレクトリに自動でアップロードされる設定となっていたので、記事中の画像リンクも変更する必要がありませんでした。

画像リンクを書き換えるか、面倒であればデフォルトの`uploads`のまま格納しても良いでしょう。どちらにせよ画像は読み込まれます。

`/static/images`に格納した場合、example.com/imagesで画像はアクセスできます。

### 記事データを移動

`/content/post`に生成された`.md`ファイル一式を格納します。

### 記事データをHugo用に調整

だいたいの記事内容はここまでの手順でHugoでも同じように出力できるようになりましたが、まだレイアウトが怪しいコンポーネントが残っているので、次はそれらをHugo向けに調整していく必要があります。私の場合はTwitterの埋め込み、Amazonアフィリエイトリンクがそれに該当しました。

これらの調整には[wordpress-to-hugo-tools](https://github.com/big-mon/wordpress-to-hugo-tools)を使っていきます。

https://github.com/big-mon/wordpress-to-hugo-tools

#### Twitter埋め込みタグを整形

コンソールが立ち上がるので、ダウンロードしてきた記事データフォルダを指定して実行します。

#### Rinkerタグ

Amazon の商品紹介プラグインとしてRinkerにお世話になっていたのですが、こちらも簡易的なHTMLに変換します。コンソールが立ち上がるので、ダウンロードしてきた記事データフォルダを指定して実行します。

簡易なHTMLにした後は、自分でCSSを定義して見えるものにするという事ですね。

### 画像データを整理

引き続き[wordpress-to-hugo-tools](https://github.com/big-mon/wordpress-to-hugo-tools)を使用して画像データを整理していきます。

WordPressを利用していると画像が無尽蔵にサイズ違いの差分が生成されるので、オリジナル以外はバッサリと削除してしまいます。

### Vercelでホスティング

これまでの作業中、適宜`hugo server`で動作を確認していればこの時点で見れるものが出来上がっているはずです。

GitHubにリポジトリを作り、必要なファイル類一式をプッシュしておきます。この辺りの手順はHugoやGatsbyJSの導入を紹介した記事がたくさんあるので参考に。

あとはVercelからGitHubのリポジトリを取り込んで、デプロイして、DNSの向き先をVercelに変えればおしまいです。DNSでCloudflareなどのCDNも併用していた場合、Vercelは自前のCDNを利用しているので事情がない限りはプロキシを切った方が性能が出るようになります。

#### Vercelのリダイレクト設定

WordPressでは動的なパーマリンク設定を使用していたので、`/p=xxxxx`のようなクエリ文字列が使用されたURLが生成されていましたが、Hugoでは`=`といった記号は通常は削除されて認識されます。(最初期に設定を誤ったまま来てしまったので、この例は厳密にはクエリ文字列ではありません)

なので308コードでのリダイレクト設定をしておきましょう。

```toml
[permalinks]
  posts = "/post/:slug/"
```

上記がHugoのconfig.tomlにおけるパーマリンクの設定です。

Vercelでリダイレクト設定を行うには`vercel.json`をルートに作成する必要があります。

```json
{
  "redirects": [{ "source": "/p=:slug", "destination": "/post/:slug", "permanent": true }]
}
```

上記の設定だと`/p=xxxxx`にアクセスすると`/post/xxxxx`にリダイレクトされる設定となります。

## おわり

VercelやNetlifyなど便利なJAMstackプラットフォームが登場して日々便利さを実感しますね。

Cloudflareも参入する様なので、どんどん刺激しあって便利になっていってほしいものです。
