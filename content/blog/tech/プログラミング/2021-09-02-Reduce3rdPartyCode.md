---
title: Next.jsの「第三者コードの影響を抑えてください」の改善失敗
description: 「x-dns-prefetch-control」を使用した改善策はスコア変動なし
slug: nextjs-fail-reduce-the-impact-of-third-party-code
publishedAt: 2021-09-02T22:22:00
coverImage: /Hero/pexels-cottonbro-5483064.jpg
category: Tech
tags: ['プログラミング', 'PageSpeedInsight']
---

PageSpeed Insightsで「第三者コードの影響を抑えてください」と怒られたので改善策を試します。

[前回](./hugo-shortcode-to-nextjs)意気揚々とNext.js 用のブログテーマを作り適用したのですが、Google Adsenseを読み込むようにした状態でスコアを計測するとGoogle Adsenseのコード読み込みがウェブサイトの描画速度に負荷をかけているという理由で大きくスコアを下げられてしまいました。

なので今回はNext.jsで「第三者コードの影響を抑えてください」と指摘された場合のスコア改善を行います。ちなみに英語版のPageSpeed Insightでの計測時は「Reduce the impact of third-party code」という指摘になります。

**結論として検索して上位に出てくる方法はNext.js 向けには効果がありません**でした。(Next.jsはSSGとして利用、スコア上の有意差は感じられなかった)

# PageSpeed Insight - スコア

## Before - 50

数回計測しなおしたところ約50点でした。以下が改善前の \_document.tsx の記載です。

```javascript
<Head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxx"
    crossOrigin="anonymous"
  />
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</Head>
```

## After - 50

改善後も変わらず。

`x-dns-prefetch-control`を有効にし`preconnect`と`dns-prefetch`にて、Google Adsense関連の名前解決を事前に行わせることで読み込みを改善しようと試みました。が、計測結果はほとんど変わらず違いが見出せませんでした。

```javascript
<Head>
  <meta httpEquiv="x-dns-prefetch-control" content="on" />
  <link href="https://pagead2.googlesyndication.com" rel="preconnect dns-prefetch" />
  <link href="https://googleads.g.doubleclick.net" rel="preconnect dns-prefetch" />
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxx"
    crossOrigin="anonymous"
  />
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</Head>
```

# まとめ

Google Adsenseの速度改善は諦めることにしました。ちなみにGoogle Adsenseを外して計測するとモバイルは97点、パソコンは100点になりました。

PageSpeed Insight上のスコアは確かに低いですが、ロード中の時系列ごとの描画イメージは2個目から描画が始まり3個目ではすでにファーストビューの描画が完了しているのでユーザーエクスペリエンスはスコアほどの悪化はしていないはずです。

そもそもなぜPageSpeed Insightはasync属性で読み込んでいるスクリプトがレンダリングをブロックしていると計上しているのでしょうか？defer属性に変更してみたら更にスコアが低下したのでいまいち謎な仕様でした。
