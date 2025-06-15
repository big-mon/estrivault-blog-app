---
title: Stable Diffusionでオリジナルマージを作成
description: AUTOMATIC1111のCheckpoint Merger機能で簡単モデルマージ。viewer-mixとMeinaPastelを組み合わせてEstrildaMixを作成。異なる比率でのマージ結果比較と実践的な手順を解説。
slug: try-stable-diffusion-merge
publishedAt: 2023-03-26T03:30:00
coverImage: /Hero/stable-diffusion-try-merge
category: Tech
tags: ['ソフトウェア', 'Stable Diffusion']
---

勉強がてら自分自身でStable Diffusionのマージを作成してみます。

階層マージは難しそうなので単純マージを試します。

# 今回試すマージ手法

AUTOMATIC1111に搭載されている「Checkpoint Merger」を使用します。

![Checkpoint Merger](/Tech/g6dzo80nmfupxhmo5gvu)

Primary model (A)と Secondary model (B)にそれぞれ混ぜたいモデルを選択します。今回は下記のモデルをそれぞれ選択してみました。いずれも「[CreativeML Open RAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license)」をライセンスとしています。

- A：[viewer-mix_v1.7_v2](https://civitai.com/models/7813/viewer-mixv17)
- B：[MeinaPastel - V4](https://civitai.com/models/11866/meinapastel)

A:0.25 x B:0.75の比率でマージするEstrildaMixとA:0.35 x B:0.65でマージするEstrildaMix2を作成してみます。

```code
Checkpoint saved to /stable-diffusion-webui/models/Stable-diffusion/EstrildaMix.safetensors
Time taken: 44.74sTorch active/reserved: 159/242 MiB, Sys VRAM: 2284/8192 MiB (27.88%)
```

約40秒でモデルの格納先に出力されました。

## マージ前後を比較してみる

下記のプロンプトで生成した画像を比較してみましょう。

```prompt
1girl, solo,
high resolution, masterpiece, best quality, extremely detailed CG:0.9, illustration, classroom, sitting,
long hair, brown hair BREAK white school cardigan BREAK black pantyhose BREAK black pleated skirt BREAK brown loafer BREAK green eye,
Negative prompt: EasyNegative, bad anatomy, (worst quality, low quality:1.4), ((disfigured)), text:1.1, title, logo, signature, nsfw,
Steps: 20, Sampler: DPM++ SDE Karras, CFG scale: 6, Seed: 2582170107, Size: 768x512, Model hash: c47e3a94e9, Clip skip: 2
```

![マージ元](/illust/awfq7qxwkzrsceayxkrr.png)

viewer-mixは淡く柔らかい雰囲気のタッチが特徴なのに対して、MeinaPastelはよりアニメ的かつリアリスティックな描写に優れたモデルです。MeinaPastelは私のプロンプトの書き方に対して欲しい要素が出てきやすいため表現のしやすさを保ちつつ、少しviewer-mixのタッチの雰囲気を取り込みたいという思いでマージしてみました。

![マージ後](/illust/wanpozagesqq0tehpcpt.png)

EstrildaMixとEstrildaMix2を見比べてみると、viewer-mixの比率を少し高めた後者では顔の輪郭のクセがviewer-mix感が出ていますね。個人的にはこれらの更に中間くらいが好みなのでA:0.3 x B:0.7で再度マージし直します。

---

……と、こんな感じでマージ比率を変えたり繰り返し様々なモデルとマージを繰り返していくことで、好みに寄せたモデルを作り出すことができるようになります。

ライセンスは基本的にマージ元となったモデルのものを引き継いでいくことになるため、どのモデルをどの比率でマージしたか以外にも各モデルのライセンスを控えておくと良いでしょう。
