# プラグイン開発ガイド

このドキュメントでは、Content Processor のプラグイン開発方法について説明します。

## 基本的なプラグインの構造

プラグインは以下のような構造を持ちます：

```typescript
import { Plugin, PluginContext, ProcessContext } from '@estrivault/content-processor';

const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  async initialize(context) {
    // 初期化処理
  },
  
  async process(content, context) {
    // コンテンツ処理
    return content; // 処理済みのコンテンツを返す
  },
  
  async processMeta(meta, context) {
    // メタデータ処理
    return meta; // 処理済みのメタデータを返す
  },
  
  async cleanup() {
    // クリーンアップ処理
  }
};

export default myPlugin;
```

## プラグインの登録

プラグインは `ContentProcessor` のコンストラクタで登録します：

```typescript
import { ContentProcessor } from '@estrivault/content-processor';
import myPlugin from './my-plugin';

const processor = new ContentProcessor({
  plugins: [
    myPlugin,
    // 他のプラグイン...
  ]
});
```

## コンテキスト

### PluginContext

`initialize` メソッドで受け取るコンテキストです。

```typescript
interface PluginContext {
  // プラグインの設定にアクセス
  config: Record<string, any>;
  
  // ロガー
  logger: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string, error?: Error) => void;
  };
  
  // 他のプラグインにアクセス
  getPlugin(name: string): Plugin | undefined;
}
```

### ProcessContext

`process` と `processMeta` メソッドで受け取るコンテキストです。

```typescript
interface ProcessContext {
  // ファイルパス（ファイルから処理する場合）
  filePath?: string;
  
  // 処理オプション
  options: ProcessOptions;
  
  // メタデータ（processメソッドでのみ利用可能）
  meta?: Record<string, any>;
  
  // キャッシュの取得・設定
  cache: {
    get<T = any>(key: string): T | undefined;
    set<T = any>(key: string, value: T): void;
  };
}
```

## プラグインの例

### 1. シンプルな変換プラグイン

```typescript
const markdownItPlugin = {
  name: 'markdown-it',
  version: '1.0.0',
  
  async process(content) {
    const MarkdownIt = await import('markdown-it');
    const md = new MarkdownIt();
    return md.render(content);
  }
};
```

### 2. メタデータ処理プラグイン

```typescript
const metaProcessor = {
  name: 'meta-processor',
  version: '1.0.0',
  
  async processMeta(meta) {
    return {
      ...meta,
      processedAt: new Date().toISOString(),
      // デフォルト値の設定
      draft: meta.draft ?? false,
      // タグの正規化
      tags: Array.isArray(meta.tags) 
        ? meta.tags.map(tag => tag.trim().toLowerCase())
        : []
    };
  }
};
```

### 3. キャッシュを利用するプラグイン

```typescript
const cachedProcessor = {
  name: 'cached-processor',
  version: '1.0.0',
  
  async process(content, context) {
    const cacheKey = `processed:${context.filePath || 'content'}`;
    
    // キャッシュから取得
    const cached = context.cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // 重い処理のシミュレーション
    const result = await someHeavyProcessing(content);
    
    // キャッシュに保存
    context.cache.set(cacheKey, result);
    
    return result;
  }
};
```

## ベストプラクティス

1. **パフォーマンス**
   - 重い処理はキャッシュする
   - 非同期処理を適切に使用
   - 不要な処理を避ける

2. **エラーハンドリング**
   - 適切なエラーメッセージを提供
   - プラグインのエラーが他の処理に影響を与えないようにする

3. **テスト**
   - 単体テストを書く
   - エッジケースを考慮する

4. **ドキュメンテーション**
   - プラグインの目的と使い方を記載
   - 設定オプションを文書化
   - 依存関係を明記
