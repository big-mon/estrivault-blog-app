---
title: Next.jsに2行でプログレスバーを導入する
description: YouTubeなどでも実装されている機能を手軽に実現
slug: nextjs-install-progressbar
publishedAt: 2021-09-04T02:50:00
coverImage: /Hero/nextjs-logo.jpg
category: Tech
tags: ['プログラミング', 'JAMstack']
---

Next.jsにプログレスバーを導入してみましょう。

GoogleやMediumといった大手が導入しているプログレスバーを手軽に実装するために作成された「[NProgress](https://ricostacruz.com/nprogress/)」を、Next.js向けに改良した「[nextjs-progressbar](https://www.npmjs.com/package/nextjs-progressbar)」を使用して実現します。

nextjs-progressbarはTypeScriptにも対応しています。

[デモページ](https://demo-nextjs-progressbar.vercel.app/)が公開されているので気になる方はご覧ください。

# nextjs-progressbar の導入方法

## インストール

まずはパッケージのインストールを行います。

```bash
npm i nextjs-progressbar
or
yarn add nextjs-progressbar
```

## \_app.js の編集

次は`_app.js`もしくは`_app.tsx`を編集します。

インポートを宣言します。

```javascript
import NextNprogress from 'nextjs-progressbar';
```

次にインポートしたコンポーネントを設置します。

```javascript
<NextNprogress />
```

以上で実装完了です。

## カスタマイズ

パラメータを付けてやることで色や線の太さといったカスタマイズが行えます。

```javascript
<NextNprogress color="#29D" startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} />
```

# おまけ

私の`_app.tsx`を晒しておきます。上記の説明でイメージが沸かなかった場合に参考にしてください。

```javascript
import type { AppProps } from "next/app";
import Head from "next/head";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
import NextNprogress from "nextjs-progressbar";
import "tailwindcss/tailwind.css";
import "../styles/prism.css";

const App = ({ Component, pageProps, router }: AppProps) => {
  return (
    <>
      <Head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <NextNprogress color="#4338ca" stopDelayMs={100} height={2} />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
};

export default App;
```

```amazon:B07DK8QHGV
後宮の烏
```
