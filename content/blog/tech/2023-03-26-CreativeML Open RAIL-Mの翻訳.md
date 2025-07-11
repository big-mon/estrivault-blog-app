---
title: CreativeML Open RAIL-Mの翻訳
description: Stable DiffusionのCreativeML Open RAIL-Mライセンス日本語翻訳。知的財産権、使用制限、配布条件、責任範囲まで、AIモデル利用で押さえるべき法的要件を詳細解説。
slug: japanese-translation-for-license-of-stable-diffusion
publishedAt: 2023-03-26T01:00:00
coverImage: /Hero/stable-diffusion-pastel-output
category: Tech
tags: ['ソフトウェア', 'Stable Diffusion']
---

Stable Diffusionで採用されているライセンス「[CreativeML Open RAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license)」について、日本語訳を探しても口語体だったりといまいちしっくりこないため、自分向けに原文を翻訳しておこうと思います。(原文が優先されるため、翻訳の解釈が間違っている可能性に注意)

脚注が必要と思った部分については都度挿入しています。

記事執筆時点では2022年8月22年に改訂されたライセンスを基としています。

---

## 1章: 前置き

マルチモーダル生成モデルは広く採用、使用されており、アーティストをはじめとする個人がAIやML技術をコンテンツ制作のツールとして捉え、活用する方法を変える可能性があります。

これらの技術が現在から将来にかけて社会へもたらす利益とは別に、技術的/倫理的な観点から悪用されるリスクについても懸念があります。

要するにこのライセンスはAIモデルについて自由と利用者の責任の両立を目指しています。自由な性質の側面として、知的財産権の付与に関してはオープンソースの寛容的なライセンスを参考としています。利用者の責任の性質の側面として、このモデルが悪用される可能性がある場合にライセンサーがライセンスを行使して使用を制限することを可能としました。またアートやコンテンツ生成のための生成モデルとして開かれつつ責任ある研究を促進することを目指しています。

派生バージョンのモデルが派生元とは異なるライセンス条件でリリースされた場合でも、必ず少なくとも元のライセンス(本ライセンス)と同じ使用制限を含めなくてはなりません。私たちは自由と責任あるAI開発を信じており、このライセンスがAI分野で責任あるオープンサイエンスを実現するためのバランスをとることを目指しています。

このライセンスはモデルおよびその派生物の使用を規制し、モデルに関連付けられたモデルカードに基づいています。

そのため、あなたとライセンサーは下記の通りに同意することとします。

> **マルチモーダル生成モデル**：テキストや画像、音声など複数種類の様式を組み合わせて処理できるAIモデルを指す。

> **モデルカード**：モデルに関する定義を記載した資料、[HuggingFace](https://huggingface.co/course/ja/chapter4/4?fw=tf)に詳しい解説が掲載されています。

> もともとのライセンスで定められた特定の使用制限がある場合、それらの制限は特記されない限りモデルの派生版にも適用されるべきであり、派生版のライセンスがそれらの制限を含むことが求められます。

### 第1項：定義

- **ライセンス**：この文書で定義される使用、複製、および配布の条件を意味します。
- **データ**：モデルの学習、事前学習、またはその他の評価に使用されるデータセットから抽出された情報および/またはコンテンツの集合を指します。データは、このライセンスではライセンスされません。
- **出力**：モデルの操作結果として生じる情報コンテンツを意味します。
- **モデル**：添付資料に記載されたモデルアーキテクチャに対応する学習済みの重み、パラメータ(オプティマイザの状態を含む)、データを使用して添付資料を使用して全部または一部で訓練またはチューニングされた、機械学習に基づくアセンブリ(チェックポイントを含む)を指します。
- **モデルの派生物**：モデルに対するすべての修正、モデルに基づく作品、またはモデルの重み、パラメータ、活性化または出力のパターンを他のモデルに転送して、他のモデルがモデルと同様に機能するように作成または初期化された他のモデルを指します。これには、中間データ表現を使用する蒸留方法や、モデルによる他のモデルの訓練用の合成データの生成に基づく方法が含まれますが、これに限定されません。
- **補足資料**：モデルの定義、実行、読み込み、ベンチマーク、評価に使用される添付のソースコードおよびスクリプトであり、訓練または評価用のデータの準備に使用されるものを指します。これには、添付の文書、チュートリアル、例などが含まれます。
- **配布**：モデルまたはモデルの派生物を第三者に伝送、複製、出版、またはその他の方法で共有することを意味し、電子的またはその他のリモート手段で提供されるホストサービスとしてのモデルを含みます。(ex. APIベースやウェブアクセス)
- **ライセンサー**：ライセンスを付与する著作権所有者または著作権所有者によって許可された団体を指し、モデルおよび/またはモデルの配布に権利を持つ可能性がある個人または団体を含みます。
- **あなた(またはあなたの)**：このライセンスによって付与された許可を行使し、またはモデルを目的や使用分野に関係なく使用する個人または法人を指します。これには、エンドユースアプリケーションでのモデルの使用が含まれます(ex. チャットボット、翻訳者、画像生成器)。
- **第三者**：ライセンサーまたはあなたと共同管理下にない個人または法人を指します。
- **コントリビューション**：著作権所有者または著作権所有者に代わって提出することが許可された個人または法人によって、モデルに含めるために意図的にライセンサーに提出された著作物、モデルの元のバージョンおよびそのモデルまたはモデルの派生物に対する変更または追加を指します。この定義の目的のため「提出された」とは、ライセンサーまたはその代表に送信される電子、口頭、または書面によるあらゆる形態のコミュニケーションを意味し、モデルの議論と改善を目的としてライセンサーまたはその代理人が管理する電子メーリングリスト、ソースコード管理システム、および問題追跡システムに限定されません。ただし、「コントリビューションではありません」と明示的に記載されたコミュニケーションは除外されます。
- **コントリビューター**：ライセンサーおよび著作権所有者または法人が寄稿を受け取り、その後モデルに組み込まれた個人または法人を指します。

## 2章：知的財産権

著作権および特許権は、モデル、モデルの派生物、および補足資料に適用されます。モデルおよびモデルの派生物は、3章で説明される追加の条件に従います。

### 第2項：著作権ライセンスの付与

このライセンスの条件に従い、各コントリビューターはあなたに対して「補足資料/モデル/モデルの派生物」を「複製/準備/公に表示/公に実行/サブライセンスを付与/配布」するための「永続的/世界的/非独占的/無償/ロイヤリティフリー/取消不能」の著作権ライセンスをここに付与します。

### 第3項：特許ライセンスの付与

このライセンスの条件に従い、適用される場合およびその範囲で、各コントリビューターはあなたに対して「モデル/補足資料」を「作成/作成させる/使用/販売を申し出る/販売/輸入/その他の方法で転送」するための「永続的/世界的/非独占的/無償/ロイヤリティフリー/取消不能」(この段落で述べられている場合を除く)の特許ライセンスをここに付与します。ただし、このライセンスは、そのようなコントリビューターによってライセンス可能な特許請求のみに適用され、それらの請求は、コントリビューションだけで必然的に侵害されるか、コントリビューションが提出されたモデルとの組み合わせで侵害されます。モデルおよび/または補足資料またはモデルおよび/または補足資料に組み込まれたコントリビューションが直接または間接的な特許侵害を構成すると主張して、あなたがいかなる団体に対しても特許訴訟(訴訟における交差請求または反訴を含む)を起こす場合、このライセンスに基づいてモデルおよび/または作品に対してあなたに付与された特許ライセンスは、そのような訴訟が主張されたり提起されたりした日から終了します。

> 特許はあくまでもコントリビューションであればそのコントリビューションの範囲に限られ、コントリビューションをしたからといってそのモデル全体に自身の特許が適用されるわけではありません。

## 3章：使用、配布、再配布の条件

### 第4項：配布と再配布

あなたは以下の条件を満たす限り、変更の有無にかかわらずモデルまたはモデルの派生物のコピーを、任意の媒体で第三者がリモートアクセスできる目的でホスト(ex. SaaS)、複製、および配布することができます。

- a：使用に基づく制限は、第5項で言及されているように、モデルまたはモデルの派生物の使用および/または配布を規定する法的合意(ex. ライセンス)の実行可能な条項として、あなたが含める必要があります。また、モデルまたはモデルの派生物が第5項に従うことを、配布先の後続のユーザーに通知しなければなりません。この規定は、補足資料の使用には適用されません。
- b：モデルまたはモデルの派生物を受け取る第三者に、このライセンスのコピーを提供しなければなりません。
- c：修正されたファイルには、ファイルを変更したことを明示する目立つ通知を表示する必要があります。
- d：モデル、モデルの派生物のいずれかの部分に関係のない通知を除いて、すべての著作権、特許、商標、および帰属表示を維持しなければなりません。あなたは、あなたの変更にあなた自身の著作権表示を追加し、使用、複製、またはあなたの変更の配布、またはモデルの派生物全体について、追加のまたは異なるライセンス条件を提供することができます。ただし、第4項aを尊重し、モデルの使用、複製、および配布が、このライセンスで述べられている条件に従っている場合に限ります。

> CreativeML Open RAIL-Mをライセンスに含むモデルでは、別途制限事項が追加されている場合は「修正CreativeML Open RAIL-M」ライセンスとして扱われ、一般的には添付資料Aに追記が行われます。その他の条項について加筆が行われている場合、何らかの修正箇所の強調が求められているため、変更箇所は比較的わかりやすいでしょう。

### 第5項：使用に基づく制限

添付資料Aに記載されている制限は、使用に基づく制限と見なされます。したがって、指定された制限付きの使用目的でモデルおよびモデルの派生物を使用することはできません。このライセンスに従って、合法的な目的で、ライセンスに従った方法でのみモデルを使用することができます。使用は、モデルでコンテンツを作成したり、ファインチューニング、更新、実行、トレーニング、評価、および/または再パラメータ化を行うことを含む場合があります。あなたは、モデルまたはモデルの派生物を使用するあなたのすべてのユーザーに、この段落(第5項)の条件を遵守するよう求める必要があります。

### 第6項：あなたが生成する出力

ここで述べられていることを除き、ライセンサーはモデルを使用して生成された出力に対して権利を主張しません。あなたは、生成された出力とその後の使用に対して責任を負います。出力の使用は、ライセンスで述べられているいかなる規定にも違反してはなりません。

> 生成物に対してライセンサーは権利を主張しない代わり、責任は自分自身で負う必要があります。

## 4章：その他の規定

### 第7項：更新と実行時の制限

法律で最大限許される範囲で、ライセンサーは、このライセンスに違反するモデルの使用を制限する権利(遠隔操作またはその他の方法で)、電子的手段によるモデルの更新、または更新に基づくモデルの出力の変更を行う権利を留保します。あなたは、モデルの最新バージョンを使用するために合理的な努力を行う必要があります。

> モデルのバージョンが更新された場合、努力して最新バージョンを使用する必要があります。

### 第8項：商標および関連事項

このライセンスには、ライセンサーの「商標/商号/ロゴを使用/承認を示唆/当事者間の関係を誤って表現」することを許可するものではありません。また、本書で明示的に許諾されていない権利は、ライセンサーによって留保されています。

### 第9項：保証の免責

適用法または書面での合意によって必要とされる場合を除き、ライセンサーは、モデルおよび付属資料(および各コントリビューターは、そのコントリビューション)を、「現状有姿」の基準で、明示または黙示を問わず、いかなる保証または条件もなく提供します。これには、タイトル、非侵害、商品性、特定目的への適合性に関する保証または条件が含まれますが、これに限定されません。あなたは、モデル、モデルの派生物、および付属資料の使用または再配布の適切性を判断し、本ライセンスに基づく許可の行使に関連するリスクを引き受ける責任を負います。

### 第10項：責任の制限

いかなる場合も、法律理論が不法行為(過失を含む)、契約、その他であるかにかかわらず、適用法(故意かつ重大な過失行為など)または書面での合意によって必要とされる場合を除き、コントリビューターは、本ライセンスの結果またはモデルおよび付属資料の使用または使用できないことによって生じるいかなる性質の直接的、間接的、特別、偶発的、または結果的損害(営業停止、コンピュータの故障や誤動作、およびその他の営業上の損害や損失に対する損害賠償を含むがこれに限定されない)に対して、あなたに対して責任を負いません。たとえそのようなコントリビューターがそのような損害の可能性を知らされていたとしても。

> モデルを利用した際に損害が生じたとしても原則すべて自分自身が責任を負う必要があります。

### 第11項：保証または追加責任の受け入れ

モデル、モデルの派生物、および付属資料を再配布する際に、サポート、保証、補償、または本ライセンスに一貫したその他の責任義務および/または権利の受け入れに対して料金を請求することを選択できます。ただし、そのような義務を受け入れる場合、他のコントリビューターを代表してではなく、あなた自身を代表して、あなた自身の責任で行動し、あなたが保証または追加責任を受け入れることによって生じた責任や、そのようなコントリビューターに対して主張された請求に対して、各コントリビューターを免責することに同意する場合に限ります。

> 再配布を行う際に対象物のサポート業務の委任を受けることもできますが、その際に生じる責任はコントリビューターではなく自分自身のものとなります。(コントリビューターに対して何かしら請求が行われたとしても、コントリビューターはその請求に対して免責されます)

### 第12項：

本ライセンスのいずれかの条項が無効、違法、または執行不能と判断された場合でも、残りの条項は影響を受けず、そのような条項がここに記載されていなかったかのように有効となります。

---

## 添付資料A

### 使用制限

あなたは、モデルまたはモデルの派生物を以下の目的で使用しないことに同意します。

- 適用される国内、連邦、州、地方、または国際法または規制に違反する
- 未成年者を搾取、害する、または搾取または害することを試みる
- 他人を害する目的で、事実上誤った情報および/またはコンテンツを生成または普及させる
- 個人を害するために使用できる個人を特定できる情報を生成または普及させる
- 他人を中傷、誹謗中傷、またはその他の方法で嫌がらせをする
- 個人の法的権利に悪影響を与えるか、または拘束力のある執行可能な義務を作成または変更するための完全自動化された意思決定
- オンラインまたはオフラインの社会的行動、既知または予測される個人的または人格的特性に基づいて、個人または集団に対して差別または害を与えることを目的とした、またはそのような効果がある使用
- 年齢、社会、身体的または精神的特性に基づく特定の人々のグループの脆弱性を利用し、そのグループに属する人々の行動を物質的に歪め、その人または他の人に身体的または心理的害を与える、またはそうなりそうな方法
- 法的に保護された特性またはカテゴリに基づいて個人またはグループに対して差別することを目的とした、またはそのような効果がある使用
- 医療アドバイスや医療結果の解釈を提供
- 司法、法執行、移民、または庇護手続きなど、個人が詐欺/犯罪を犯すことを予測するために使用される情報を生成または普及させる目的(ex. テキストプロファイリング、文書で行われた主張間の因果関係を描く、無差別で恣意的に対象とした使用など)

> 法律に違反すること、他者に誤解を招くようなことといった一般常識的な内容が当然禁止されています。
> 人間を介さずに法的な効力を発揮する成果物を出力することは禁止されています。
> 医療に関しての利用は特に注意が必要で、アドバイス資料や解釈の資料としての使用が禁止されています。(例えば美容整形の予測図など)
