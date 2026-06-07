---
title: MuleSoft開発をAIファーストにするための設計ドキュメント標準化
description: MuleSoft開発におけるAIファーストな設計ドキュメント管理方針を、README、AGENTS.md、design-index.yaml、RAMLの役割分担から整理します。
slug: mulesoft-ai-first-design-docs
publishedAt: 2026-06-07T23:31:00
coverImage: /Hero/i2f3u46omjkqialreyh4
category: software
tags: ['プログラミング', 'MuleSoft']
---

Claude CodeやCodexといったAIコーディング支援の波がやってきました。

今回は、MuleSoftを用いたAPI基盤開発の現場で、AIによる生産性・品質向上を狙うにあたり、設計成果物の管理方法を見直した話を書きます。

AIによる生産性向上は、現場よりも経営陣に導入した方がよほど効果的なのでは、という元も子もない意見もあるかもしれません。とはいえ、今回は「とりあえず現場レベルを何とかしたい」という強固な前提で進めます。

## なぜ設計成果物を見直すのか

AIの効果が一番わかりやすく出るのは、おそらくコーディング工程です。

ただ、ウォーターフォール開発では実装は設計に基づき、設計は要件定義に基づきます。つまり、AIに実装を手伝わせたいのであれば、その前段にある設計成果物をAIが読める状態にしておく必要があります。

極論、要件定義から基本設計、詳細設計までが十分に構造化されていれば、AIはかなりの範囲で実装やレビューを支援できるはずです。

もちろん、AIが理解しやすい設計書が、そのまま人間にとって読みやすいとは限りません。とはいえ、人間だけに最適化されたドキュメントを作り続けていてはAI導入が進みません。

そこで今回は、人間も読めて、AIも読みやすい設計成果物の形を考えることにしました。

## 従来の課題

今回のチームでは、従来の設計成果物はPowerPointで書かれた要件定義と、方眼紙Excelで書かれたAPI項目一覧が中心でした。

これは人間が読む前提で作られた資料であり、LLMに読ませるにはあまり向いていません。もちろん最近のAIはPowerPointやExcelもある程度読めますが、MarkdownやYAML、RAMLのように構造が明確なテキストの方が扱いやすいはずです。(AIに尋ねたところそう答えたので正しいはずです)

というわけで、まずは設計成果物をGitで管理しやすく、AIにも読ませやすい形に寄せていきます。

## 基本方針

要件定義については、PowerPointの内容をMarkdownへ移すだけでもかなり改善できそうでした。問題は基本設計と詳細設計です。

MuleSoft開発では、関心ごとがいくつかの単位に分かれます。

```text
Application
  └─ API
       └─ Operation
```

Applicationは、Muleアプリケーション、つまりjar、Gitリポジトリ、デプロイ単位です。

APIは、RAMLのroot、API Manager、APIkit Routerなどで扱うAPI契約の単位です。

Operationは、`GET /customers/{customerId}` のようなHTTP Method + Pathの単位です。最終的にはMule FlowやMUnitテストに対応する、実装・テストの最小単位になります。

開発・ビルド・デプロイはApplication単位。
APIの公開や管理はAPI単位。
実装やテストはOperation単位。

この分かれ方に合わせて、設計成果物も整理することにしました。

## リポジトリ構成

設計書を刷新すると言うと、ドキュメントを増やす方向に進みがちです。今回は逆で、増やすのではなく、置き場所と責務をはっきりさせます。

ざっくり以下のような構成にします。

```text
mule-app-repository/
  ├─ README.md
  ├─ AGENTS.md
  ├─ design-index.yaml
  │
  ├─ docs/
  │   ├─ application-basic-design.md
  │   └─ application-detail-design.md
  │
  └─ raml/
      ├─ common/
      ├─ xxx-api/
      │   └─ v1/
      │       ├─ xxx-api.raml
      │       ├─ resources/
      │       ├─ types/
      │       ├─ traits/
      │       └─ examples/
      └─ yyy-api/
          └─ v1/
              ├─ yyy-api.raml
              ├─ resources/
              ├─ types/
              ├─ traits/
              └─ examples/
```

細かいテンプレートや記載例はGitHub側に置く想定です。この記事では、どういう思想で分けたのかだけに絞ります。

https://github.com/big-mon/mulesoft-ai-first-docs-structure-template

## README.md

`README.md` は、人間とAIの入口です。

このリポジトリが何のMuleアプリケーションなのか、どのAPIを含んでいるのか、設計書やRAMLがどこにあるのかを最初に把握するためのファイルです。

AIに「このリポジトリを理解して」と依頼したとき、いきなり全ファイルを読ませるのではなく、まずREADMEから読ませます。そこで全体像を掴んだうえで、必要な設計書やRAMLに進んでもらう想定です。

## AGENTS.md

`AGENTS.md` は、AIエージェント向けの作業指示書です。

AIに読ませる順番、正本として扱うファイル、勝手に変更してはいけないもの、レビュー時に見るべき観点などを書きます。

例えば、次のような内容です。

```text
- まず README.md を読む
- 次に design-index.yaml で全体構造を把握する
- API契約はRAMLを正とする
- RAMLと詳細設計が矛盾していたら、黙って直さず指摘する
- Operation IDを勝手に変更しない
- 実装だけを見てAPI仕様を推測しない
```

AIは便利ですが、前提を与えないとかなり元気よく推測します。設計管理では、その推測が事故につながることがあります。

なので、AIに自由に考えてもらう前に、守るべきルールを明示しておきます。

## design-index.yaml

`design-index.yaml` は、設計成果物の地図です。

設計内容そのものを大量に書く場所ではありません。Application、API、Operation、RAML、Mule Flow、DataWeave、MUnitの対応関係を追うための索引として使います。

特に、1つのMuleアプリケーション内に複数APIが存在することがあるため、APIは単数ではなく `apis[]` として扱います。

イメージは以下です。

```yaml
application:
  appId: sample-domain-api
  artifactName: sample-domain-api.jar

apis:
  - apiId: sample-customer-api-v1
    rootRaml: raml/sample-customer-api/v1/sample-customer-api.raml
    operations:
      - operationId: sample-customer-api-v1.customer.getById
        method: GET
        path: /customers/{customerId}
        raml: raml/sample-customer-api/v1/resources/customer-get-by-id.raml
        flow: get-customer-by-id-flow

  - apiId: sample-address-api-v1
    rootRaml: raml/sample-address-api/v1/sample-address-api.raml
    operations:
      - operationId: sample-address-api-v1.address.getByCustomerId
        method: GET
        path: /customers/{customerId}/addresses
        raml: raml/sample-address-api/v1/resources/address-get-by-customer-id.raml
        flow: get-address-by-customer-id-flow
```

これがあると、AIにも人間にも「このOperationはどのRAML、どのFlow、どのテストにつながっているのか」が見えやすくなります。

## RAML

RAMLはAPI契約の正本として扱います。

基本設計時点でRAMLを作成し、リクエスト、レスポンス、パラメータ、ステータスコード、エラー応答などを定義します。詳細設計で初めてRAMLを書くのではなく、基本設計でAPI契約を固める方針です。

構成としては、API単位のroot RAMLを置き、Operation単位の定義は `resources/` 配下に分けます。

```text
raml/
  └─ sample-customer-api/
      └─ v1/
          ├─ sample-customer-api.raml
          ├─ resources/
          │   ├─ customer-get-by-id.raml
          │   └─ customer-search.raml
          ├─ types/
          ├─ traits/
          └─ examples/
```

root RAMLでAPI全体を表現し、Operation単位の入出力定義は別ファイルに逃がします。こうしておくと、API全体も見やすく、Operation単位のレビューもしやすくなります。

## 基本設計と詳細設計

基本設計は `docs/application-basic-design.md` にまとめます。

ここでは、何を作るのか、どのAPIがどんな責務を持つのか、API管理をどうするのか、主なシーケンスやエラー方針をどうするのかを書きます。

一方で、Mule FlowのProcessor明細までは書きません。API契約はRAMLを正本にし、基本設計では設計判断や補足説明を書く、という分担です。

詳細設計は `docs/application-detail-design.md` にまとめます。

ここでは、Operation単位でMule Flowを具体化します。

```text
- 対応RAML
- 対応Flow
- 入力
- 出力
- 呼び出す外部システム
- 使用するDataWeave
- Connector設定
- エラー時の扱い
- MUnitの観点
```

詳細設計ではフロー図も使いますが、図だけにはしません。Processor明細やエラー定義のような表形式の情報も残します。

人間は図で流れを掴み、AIは表で構造を追う。そんな分担を狙っています。

## フェーズごとの更新方針

どのフェーズで何を更新するかも、ざっくり決めておきます。

| フェーズ | 主に更新するもの                                                     | 目的                                        |
| -------- | -------------------------------------------------------------------- | ------------------------------------------- |
| 要件定義 | `design-index.yaml` の骨格                                           | Application / API / Operation候補を整理する |
| 基本設計 | `application-basic-design.md`, `raml/**`, `design-index.yaml`        | API契約と設計方針を固める                   |
| 詳細設計 | `application-detail-design.md`, `design-index.yaml`                  | Mule実装の入力を作る                        |
| 実装     | `src/main/mule/**`, `src/main/resources/dwl/**`, `src/test/munit/**` | Muleアプリを実装する                        |

`design-index.yaml` は全フェーズを通じて育てるファイルです。

一方で、基本設計書と詳細設計書は分けます。同じMarkdownに全部を書き続けると、どこまでが基本設計として合意された内容なのか、どこからが詳細設計なのかが曖昧になるためです。

## AIに期待すること

この方針でやりたいのは、AIにいきなり全部作らせることではありません。

まずは、AIが設計を読める状態にすることです。

設計成果物の構造が揃っていれば、AIには次のような作業を頼みやすくなります。

```text
- RAMLと基本設計の不整合を探す
- Operationごとに詳細設計の漏れを探す
- RAMLとFlow設計の対応漏れを探す
- エラー応答の定義漏れを探す
- MUnit観点の不足を洗い出す
- 変更時の影響範囲を調べる
```

特に影響調査は相性が良いと考えています。

Operation IDを軸に、RAML、Flow、DataWeave、MUnitがつながっていれば、変更の影響を追いやすくなります。

## AI専用の設計書は作らない

今回の方針は、AI専用ドキュメントを作る取り組みではありません。

人間が読む設計書を、AIにも読ませやすい形に寄せる取り組みです。

AIのためだけに別の設計書を作ると、二重管理になります。そして二重管理は、だいたい破綻します。

なので、正本を分けます。

```text
API契約はRAML
設計資産の地図はdesign-index.yaml
基本設計の判断はapplication-basic-design.md
詳細設計の実装入力はapplication-detail-design.md
```

どこに何を書くかを決め、同じ情報をなるべく重複して書かないようにします。

## まとめ

MuleSoft開発の設計成果物を、以下の三層で整理することにしました。

```text
Application
  └─ API
       └─ Operation
```

この三層を軸に、API契約、基本設計、詳細設計、実装、テストをOperation単位で追跡できるようにします。

狙いは、設計書を増やすことではありません。設計情報の置き場所と責務を明確にして、人間にもAIにも読みやすくすることです。

AIが賢くなっても、読むべき情報が散らばっていたり、正本が曖昧だったりすると、うまく働けません。

まずはAIが迷わず読める構造を作る。そこからレビュー、影響調査、実装支援、テスト観点の洗い出しに使っていく。

そんな感じで、MuleSoft開発を少しずつAIファーストに寄せていこうと思います。
