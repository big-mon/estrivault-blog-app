---
title: Docker版Stable Diffusionのモデルを変更する
description: Docker版Stable Diffusion WebUIで学習モデルを変更する方法。Hugging Faceからのモデル入手からdata/StableDiffusionフォルダへの配置まで、カスタムモデル導入の基本手順。
slug: change-stable-diffusion-model
publishedAt: 2023-03-17T01:30:00
coverImage: /Hero/stableDiffusion-20230317testOutput
category: Tech
tags: ['ソフトウェア', 'Stable Diffusion']
---

Stable Diffusionを使いやすくしたAUTOMATIC1111。

そのAUTOMATIC1111をさらにDockerで扱えるようにした「Stable Diffusion WebUI Docker」をインストールすることで、ゲーミングPCでAIイラストをブラウザから簡単に生成できるようになります。

詳しいインストール手順は[note](https://note.com/npaka/n/nc8b0e9a91d97)に先人が手順をまとめてくれています。

ただ、デフォルトだとStable Diffusionのモデルは自動でダウンロードされる「v1-5-pruned-emaonly.ckpt」と「sd-v1-5-inpainting.ckpt」しか選べないため、別の学習モデルを使用する方法を書き留めておきます。

# 学習モデルの入手方法

AI系コミュニティの[Hugging Face](https://huggingface.co/models?other=stable-diffusion)にてモデルが多数公開されています。

利用したいモデルをここから入手してきます。

今回は「v2-1_768-ema-pruned.ckpt」を入手してきました。

モデルによって出来ることや出来ないこと、得意不得意や用途があるので各自で調べましょう。

# モデルの配置

```txt
\stable-diffusion-webui-docker\data\StableDiffusion
```

gitでクローンしてきたリポジトリの上記フォルダに「v1-5-pruned-emaonly.ckpt」と「sd-v1-5-inpainting.ckpt」が格納されています。(Docker Composeにてイメージをインストールする際にダウンロードされるため、起動したことがなければまだダウンロードされていません)

このフォルダに入手したモデルを配置すれば、ブラウザから配置されたモデルを選択できるようになります。
