---
title: HugoのショートコードをNext.jsに移行
description: unifiedエコシステムを利用した置き換え
slug: hugo-shortcode-to-nextjs
publishedAt: 2021-08-30T12:00:00
coverImage: /Hero/nextjs-logo.jpg
category: Tech
tags: ['プログラミング', 'JAMstack']
---

ブログのベースとなるフレームワークをHugoからNext.jsへ変更しました。その際に**Hugo向けに作成していた独自のショートコードを移行**するのに手間取ったので、知見をシェアします。

最終的にはゴリ押しとなったので改善の余地はあります。

# Hugoショートコード

Markdownでブログ記事を書くことの多いSSG界隈ですが、Markdownの記法だけでは表現しきれない要素を埋め込みたいニーズがあります。それを満たすためにHugo利用時に使用していたのが[ショートコード](https://gohugo.io/content-management/shortcodes/)です。

私の場合は記事中にAmazon.co.jpの商品を埋め込みたいときにショートコードを使用していました。

```md
{{< amazon asin="B092ZGNKVC" title="え、社内システム全てワンオペしている私を解雇ですか？" >}}
```

# Next.jsへのショートコード移行のアプローチ

Hugoでは標準でMarkdownをHTMLへ変換できるため意識していませんでしたが、Next.jsでは変換部分に関して追加の実装が必要です。この実装部分にさらにショートコードを読み替えるための処理を追加することで実現していきます。

具体的には**Hugoショートコード用の記法で書かれた部分をHTMLタグに変換し、それをReactコンポーネントに置換**することで実現します。

1. Markdownをremarkで解析しmdastとして読み込む
1. mdastをコンパイルしてHTMLにする
1. HTMLをrehypeで解析しhastとして読み込む
1. hastをコンパイルしてReactコンポーネントにする

## MarkdownからHTMLへ変換

Markdownの変換は通常[Unified](https://github.com/unifiedjs/unified)のエコシステムを採用し、大まかには下記のような構成となっているはずです。

```js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

/** MarkdownをHTMLへ変換 */
export async function markdownToHtml(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
```

unifiedとremark-parseを使用して、Markdownを解析。HTMLへ変換可能な情報に加工を施し、remark-rehypeとrehype-stringifyを使用してHTML文字列に変換するという流れです。

「Markdown ⇒ 解析 ⇒ (加工) ⇒ 変換 ⇒ HTML」という流れです。

本当はMarkdownをHTMLに変換する時点でショートコードを独自のHTMLタグとして出力したかったのですが、mdastの加工処理が難しく少々時間がかかりそうだったので実装を優先してmdastの加工は見送ることにしました。

## Markdown - HTML - React

```js
import React from 'react';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import { CustomLink } from '../components/molecules/CustomLink';
import { PostImage } from '../components/molecules/PostImage';
import { amazonBlockConvert } from './amazonBlockConvert';
import { AmazonItem } from '../components/organisms/AmazonItem';

/** 指定したタグをReactコンポーネントに変換する定義 */
const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeReact, {
    createElement: React.createElement,
    components: { a: CustomLink, img: PostImage, amazon: AmazonItem },
  });

/** HTMLをReactコンポーネントに変換 */
export function htmlToReact(html) {
  // 独自タグを文字列からHTMLタグに変換
  const replaced = amazonBlockConvert(html);

  return processor.processSync(replaced).result;
}
```

rehype-reactを使用して、HTMLを解析した結果をReactに変換します。

上記の例ではaタグがあればCustomLinkというReactコンポーネントに置換、imgタグはPostImage、amazonタグはAmazonItemに置換することができます。今回ショートコードとして実現したかったのはamazonタグでした。

先ほどのremarkを使用した一連の処理で出来上がったHTMLに対して`amazonBlockConvert(html)`を使用して、ショートコードが書かれていた部分をamazonタグに置換しています。

```js
/**
 * 独自のAmazon用商品ブロック記法をHTMLに変換
 * {{ < amazon asin="xxxxx" title="xxxxx" > }}
 */
export function amazonBlockConvert(html) {
  const pattern = /<p>{{&#x3C;[ ]?amazon asin="(.*?)" title="(.*?)"[ ]*?>}}<\/p>/g;
  const result = html.replace(pattern, "<amazon asin='$1'>$2</amazon>");
  return result;
}
```

やっていることは正規表現によるごり押しです。Markdown上で「{{ < amazon asin="xxxxx" title="xxxxx" > }}」と記載されている部分をamazonタグに書き換えているだけです。

こうすることでrehypeが読み込む際にamazonタグとして認識されるので、あとはそれを用意しておいたReactコンポーネントに置換しています。

# まとめ

Next.jsを使用してから初めてMarkdownをHTMLに変換する処理について勉強しました。Unifiedすごい。そして自分が今まで書いていたMarkdownは元々のオリジナルではなく、gfmというデファクトスタンダードな方言だったことにも驚きました。

できれば正規表現で強引に書き換えるのではなくremark-gfmのようにremark部分でHTML変換を実現したいのですが、それはまた別の機会という事で。

なお、今回作成したAmazonの商品を紹介するためのReactコンポーネントは[npmパッケージ](https://www.npmjs.com/package/@big-mon/react-component-amazon)として切り出して公開しています。[Next.jsのテンプレート](https://github.com/big-mon/nextjs-estrilda)と合わせて公開しているので、誰かの参考になれば。

デモページはこんな感じです。

[https://big-mon.github.io/react-component-amazon-block/](https://big-mon.github.io/react-component-amazon-block/)

```amazon:B07JVCVF12
イスルイン物語　預言されし王
```
