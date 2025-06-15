---
title: 家系図作成のJSライブラリを探してみた
description: JavaScript家系図作成ライブラリの比較調査。エルデンリング登場人物の関係図作成のため、kingraph、dTree、D3、有償のBALKAN FamilyTreeJSとGoJSを検証し選定した経験談。
slug: familytree-js-library-2022
publishedAt: 2022-03-27T19:42:00
coverImage: /Hero/pexels-david-gomes-2647471
category: Tech
tags: ['ソフトウェア', 'ELDEN RING', 'ライブラリ']
---

エルデンリングのデミゴッドたちを理解するために自分で家系図を作成しようと思い、JavaScriptやMarkdownで手軽に行えるライブラリがないかと探してみました。

結果的に[big-mon/eldenring-relationship](https://github.com/big-mon/eldenring-relationship)として成果物を作成できたのですが、思った以上に家系図作成のライブラリは少なかったので、後続のために調査して目を付けたライブラリをまとめておきます。

組織図用のライブラリは豊富に見つかるけれど、家系図や血統図は貴重すぎる。

# 無料ライブラリ

## kingraph

[rstacruz/kingraph](https://github.com/rstacruz/kingraph)としてGitHubで公開されているライブラリ。

npmやyarnでインストールして使用する形式で、YAML形式で記述した内容をコマンドにてsvgやpngなどの画像に変換します。

前述したエルデンリングの家系図を生成するために最終的に使用したのがこのライブラリです。

## dTree

[ErikGartner/dTree](https://github.com/ErikGartner/dTree)としてGitHubで公開されているライブラリ。

グラフ作成ライブラリとして著名な「D3」をベースとしたライブラリです。

## D3

[D3を直接使用して家系図を作成する方法](https://bl.ocks.org/mell0kat/5cb91a2048384560dfa8f041fd9a0295)です。

D3のバージョン4を使用するコードで、調査時点では7までリリースされており少し古いのが気にかかりました。D3を本格的に触ったことがないのでコンバートする自信がなく使用を断念しました。

ただ単に家系図を作成して表示するだけの用途であれば、バージョン4のままでも問題ないかもしれませんね。

挿入するデータはJSON形式で直感的にわかりやすかったです。

# 有償ライブラリ

## BALKAN FamilyTreeJS

買い切り型のライセンスで提供されている[FamilyTreeJS](https://balkan.app/FamilyTreeJS/Demos/royal-family-tree)です。

デモを見る限りは分かりやすく見やすい家系図が作成できそうです。

## GoJS

はちゃめちゃにライセンスが高いですがあらゆる図形作成に対応している[GoJS](https://gojs.net/latest/samples/genogram.html)です。

一応、無料で使用できるライブラリが公開されています。左上に製品への使用はしないよう消せないライセンス表記が出るので完全に個人のお試し用ですが、それで十分なのであれば最も簡潔に作成できるかもしれません。

高いライセンス料なだけあって機能は豊富で、かなりのカスタマイズができそうでした。

::amazon{asin="B08KY7G1GV" name="SHURE MV7 ポッドキャストマイクロホン : ダイナミックマイク"}
