# API リファレンス

## 目次

- [ContentProcessor](#contentprocessor)
  - [コンストラクタ](#コンストラクタ)
  - [メソッド](#メソッド)
    - [processFile](#processfile)
    - [processContent](#processcontent)
    - [clearCache](#clearcache)
- [ユーティリティ関数](#ユーティリティ関数)
  - [createProcessor](#createprocessor)
  - [resolvePath](#resolvepath)

## ContentProcessor

メインのプロセッサークラスです。

### コンストラクタ

```typescript
new ContentProcessor(options?: ContentProcessorOptions)
```

#### パラメータ

| パラメータ | 型 | 説明 |
|----------|----|------|
| `options` | `ContentProcessorOptions` | オプション設定 |

#### 例

```typescript
const processor = new ContentProcessor({
  markdown: {
    // マークダウンオプション
  },
  plugins: [
    // プラグインの配列
  ]
});
```

### メソッド

#### processFile

ファイルを処理します。

```typescript
processFile(filePath: string, options?: ProcessOptions): Promise<ProcessResult>
```

##### パラメータ

| パラメータ | 型 | 説明 |
|----------|----|------|
| `filePath` | `string` | 処理するファイルのパス |
| `options` | `ProcessOptions` | 処理オプション |

##### 戻り値

`Promise<ProcessResult>` - 処理結果

##### 例

```typescript
const result = await processor.processFile('path/to/file.md', {
  // オプション
});
```

#### processContent

マークダウン文字列を直接処理します。

```typescript
processContent(content: string, options?: ProcessOptions): Promise<ProcessResult>
```

##### パラメータ

| パラメータ | 型 | 説明 |
|----------|----|------|
| `content` | `string` | 処理するマークダウン文字列 |
| `options` | `ProcessOptions` | 処理オプション |

##### 戻り値

`Promise<ProcessResult>` - 処理結果

##### 例

```typescript
const result = await processor.processContent('# 見出し', {
  // オプション
});
```

#### clearCache

キャッシュをクリアします。

```typescript
clearCache(): void
```

## ユーティリティ関数

### createProcessor

新しいプロセッサーインスタンスを作成します。

```typescript
function createProcessor(options?: ContentProcessorOptions): ContentProcessor
```

### resolvePath

パスを解決します。

```typescript
function resolvePath(basePath: string, relativePath: string): string
```

## 型定義

### ContentProcessorOptions

```typescript
interface ContentProcessorOptions {
  markdown?: MarkdownOptions;
  plugins?: Plugin[];
  cache?: boolean;
}
```

### ProcessOptions

```typescript
interface ProcessOptions {
  skipCache?: boolean;
  meta?: Record<string, any>;
}
```

### ProcessResult

```typescript
interface ProcessResult {
  html: string;
  meta: Record<string, any>;
  content: string;
}
```
