---
title: Tales of Ariseをウルトラワイド(21:9)に対応させる
description: Tales of Ariseをウルトラワイドモニター（21:9）に対応させる方法。Universal Unreal Engine Unlockerを使用したアスペクト比修正の手順と注意点を解説。
slug: tales-of-arise-fix-aspect
publishedAt: 2021-09-12T01:14:00
coverImage: /Hero/talesOfArise-title.jpg
category: Game
tags: ['Tales of Arise', 'MOD']
---

Tales of Ariseは記事時点でウルトラワイドモニターに対応していません。

MODがリリースされるのを待つのもいいですが、せっかくですから自力でアスペクト比を修正してしまいましょう。Unreal Engineで作成されているため修正は比較的簡単なようです。海外メディア[Android Gram](https://androidgram.com/tales-of-arise-ultrawide-219-support-not-available-how-to-fix-it/)にて対応方法が説明されているので、やり方を紹介します。

## Universal Unreal Engine Unlockerをダウンロード

1. [Universal Unreal Engine Unlocker](https://mega.nz/file/JQgmmTDQ#JicdedqwrbiCwj-DzfOIgJUD-HiKphSlO8Ppvkvqwfc)をダウンロード
   - 記事時点ではv3.0.19

2. Tales of Ariseを起動
3. Universal Unreal Engine Unlockerを起動
4. Universal Unreal Engine Unlocker上でTales of Ariseを選択
5. 選択後、Inject DLLを押下
   - 選択が完了するとアスペクト比が自動的に修正されますが、変更したい場合はメニューのHotsamplingから変更できます。

![Universal Unreal Engine Unlockerを起動](/Tech/toa-ueu1.jpg 'Universal Unreal Engine Unlockerを起動')

![解像度の修正](/Tech/toa-ueu2.jpg '解像度の修正')

![結果](/Tech/toa-result.jpg)

再起動すると元に戻るため、再度同じ手順を行います。

Universal Unreal Engine Unlockerに関するドキュメントは下記で確認することができます。

[https://framedsc.github.io/GeneralGuides/universal_ue4_consoleunlocker.htm](https://framedsc.github.io/GeneralGuides/universal_ue4_consoleunlocker.htm)

::amazon{asin="B09319VMGT" name="Tales of ARISE"}
