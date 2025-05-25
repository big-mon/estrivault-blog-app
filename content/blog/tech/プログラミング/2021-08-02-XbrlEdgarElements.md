---
title: EDGARからデータ取得：XBRLの代表的なタグ名のリスト
description: US-GAAP 2021をベースに作成
slug: xbrl-edgar-elements-list
publishedAt: 2021-08-02T05:26:00
coverImage: /Hero/pexels-photomix-company-95916.jpg
category: Tech
tags: ['プログラミング', 'EDGAR']
---

EDGARで[決算データを API で取得できる](./edgar-api-items)ことを前回の記事で紹介しました。

今回はXBRLで定義された項目名(タグ名)の中からよく使用するであろう代表的な値を紹介します。

# XBRLの定義名の調べ方

自分でも調べてみたいという人のために[EDGARのリンクページ](https://www.sec.gov/info/edgar/edgartaxonomies.shtml)を紹介します。

EDGARが認識しているタクソノミーは大きくUS-GAAP、SRT、IFRSの3種です。今回の記事ではUS-GAAPの2021年度版を基にタグ名を紹介します。

> 参考：[Standard Taxonomies](https://www.sec.gov/info/edgar/edgartaxonomies.shtml)

# US GAAP 2021

## 要約財務諸表

### 純売上高 Net sales

| 項目     | タグ名                                              |
| -------- | --------------------------------------------------- |
| 純売上高 | RevenueFromContractWithCustomerExcludingAssessedTax |
| 売上原価 | CostOfGoodsAndServicesSold                          |
| 粗利益   | GrossProfit                                         |

### 営業経費 Operating expenses

| 項目                 | タグ名                                 |
| -------------------- | -------------------------------------- |
| 研究開発費           | ResearchAndDevelopmentExpense          |
| 販売費及び一般管理費 | SellingGeneralAndAdministrativeExpense |
| 総事業費             | OperatingExpenses                      |

### 営業利益 Operating income

| 項目       | タグ名                    |
| ---------- | ------------------------- |
| 営業利益   | OperatingIncomeLoss       |
| 営業外収入 | NonoperatingIncomeExpense |

### 純利益 Net income

| 項目         | タグ名                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| 税引前純利益 | IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest |
| 純利益       | NetIncomeLoss                                                                               |

### per share

| 項目         | タグ名                               |
| ------------ | ------------------------------------ |
| EPS          | EarningsPerShareBasic                |
| 希薄化 EPS   | EarningsPerShareDiluted              |
| 1 株辺り配当 | CommonStockDividendsPerShareDeclared |

## 連結貸借対照表

### 資産 Assets

| 項目       | タグ名 |
| ---------- | ------ |
| 資産の合計 | Assets |

#### 流動資産 Current assets

| 項目               | タグ名                                |
| ------------------ | ------------------------------------- |
| 現金及び現金同等物 | CashAndCashEquivalentsAtCarryingValue |
| 有価証券(流動資産) | MarketableSecuritiesCurrent           |
| 売掛金             | AccountsReceivableNetCurrent          |
| 棚卸資産           | InventoryNet                          |
| 非売掛金           | NontradeReceivablesCurrent            |
| その他の流動資産   | OtherAssetsCurrent                    |
| 流動資産の合計     | AssetsCurrent                         |

#### 固定資産 Non-current assets

| 項目               | タグ名                         |
| ------------------ | ------------------------------ |
| 有価証券(固定資産) | MarketableSecuritiesNoncurrent |
| 有形固定資産       | PropertyPlantAndEquipmentNet   |
| その他の資産       | OtherAssetsNoncurrent          |
| 固定資産の合計     | AssetsNoncurrent               |

### 負債及び株主資本 Liabilities and shareholders' equity

| 項目                   | タグ名                           |
| ---------------------- | -------------------------------- |
| 負債の合計             | Liabilities                      |
| 株主資本の合計         | StockholdersEquity               |
| 負債及び株主資本の合計 | LiabilitiesAndStockholdersEquity |

#### 流動負債 Current liabilities

| 項目                   | タグ名                               |
| ---------------------- | ------------------------------------ |
| 買掛金                 | AccountsPayableCurrent               |
| その他の流動負債       | OtherLiabilitiesCurrent              |
| 前受収益               | ContractWithCustomerLiabilityCurrent |
| コマーシャル・ペーパー | CommercialPaper                      |
| 短期債                 | LongTermDebtCurrent                  |
| 流動資産の合計         | LiabilitiesCurrent                   |

#### 固定負債 Non-current liabilities

| 項目             | タグ名                     |
| ---------------- | -------------------------- |
| 長期債           | LongTermDebtNoncurrent     |
| その他の固定負債 | OtherLiabilitiesNoncurrent |
| 固定負債の合計   | LiabilitiesNoncurrent      |

#### 契約義務と偶発債務 Commitments and contingencies

| 項目               | タグ名                      |
| ------------------ | --------------------------- |
| 契約義務と偶発債務 | CommitmentsAndContingencies |

#### 株主資本 Shareholders’ equity

| 項目             | タグ名                                          |
| ---------------- | ----------------------------------------------- |
| 株式             | CommonStocksIncludingAdditionalPaidInCapital    |
| 内部留保         | RetainedEarningsAccumulatedDeficit              |
| その他の包括利益 | AccumulatedOtherComprehensiveIncomeLossNetOfTax |
| 株主資本の合計   | StockholdersEquity                              |

## 株主資本等変動計算書

| 項目       | タグ名                                      |
| ---------- | ------------------------------------------- |
| 配当       | Dividends                                   |
| 自社株買い | StockRepurchasedAndRetiredDuringPeriodValue |

## キャッシュフロー計算書

| 項目                 | タグ名                                     |
| -------------------- | ------------------------------------------ |
| 営業キャッシュフロー | NetCashProvidedByUsedInOperatingActivities |
| 投資キャッシュフロー | NetCashProvidedByUsedInInvestingActivities |
| 財務キャッシュフロー | NetCashProvidedByUsedInFinancingActivities |

### 財務キャッシュフロー Financing activities

| 項目       | タグ名                             |
| ---------- | ---------------------------------- |
| 配当支出   | PaymentsOfDividends                |
| 自社株買い | PaymentsForRepurchaseOfCommonStock |

### その他

| 項目         | タグ名                                           |
| ------------ | ------------------------------------------------ |
| 株式分割比率 | StockholdersEquityNoteStockSplitConversionRatio1 |

APIで取得できる企業と出来ない企業にバラつきがあります。例えばAAPL, TSLA, TTDでは取得できますが、NVDAでは取得できません。恐らく提出されたXBRL定義に誤りがあります。

# 文書情報 Document and Entity Information

| 項目               | タグ名                             |
| ------------------ | ---------------------------------- |
| 発行済み株式数     | EntityCommonStockSharesOutstanding |
| 浮動株式の時価総額 | EntityPublicFloat                  |

# まとめ

EDGARのAPIではメンバーを指定する様な操作は現在のところ提供されていないため、メンバー間の計算が完了した後の値のみがタグ名で取得できます。メンバーを利用したい場合はAPIを頼ることは出来なさそうです。

タグ名だけ今回掲載しましたが、タグ名だけで万単位で存在し、その配下にメンバーが小分類として存在しているので網羅して確認しようと思うと大変です。APIはメンバーを現在考慮できないこともあり、メンバーまで含めた紹介を作成する役目は他の誰かに譲るとします......

```amazon:B092ZGNKVC
え、社内システム全てワンオペしている私を解雇ですか？
```
