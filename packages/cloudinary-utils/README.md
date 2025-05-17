# @estrivault/cloudinary-utils

Cloudinary の画像URLを簡単に生成するためのユーティリティライブラリです。レスポンシブな画像配信や最適化された画像フォーマットをサポートします。

## 特徴

- 型安全なAPI
- レスポンシブ画像のサポート
- 画像の最適化（自動フォーマット、品質設定）
- プリセット機能による一貫した画像サイズ管理
- 軽量で高速な実行

## インストール

```bash
pnpm add @estrivault/cloudinary-utils
```

## 使い方

### 基本的な使用法

```typescript
import { buildUrl } from '@estrivault/cloudinary-utils';

// 基本の画像URLを生成
const imageUrl = buildUrl('your-cloud-name', 'path/to/image.jpg', {
  w: 800,          // 幅（ピクセル）
  h: 600,          // 高さ（オプション）
  mode: 'fill'     // 'fill'（トリミング）または 'fit'（アスペクト比維持）
});
```

### プリセットの使用

```typescript
import { IMAGE_PRESETS } from '@estrivault/cloudinary-utils';

// サムネイル画像を取得
const thumbnailUrl = buildUrl(
  'your-cloud-name',
  'path/to/image.jpg',
  IMAGE_PRESETS.thumbnail.SQUARE  // 150x150 の正方形サムネイル
);

// ソーシャルメディア用画像を取得
const socialImageUrl = buildUrl(
  'your-cloud-name',
  'path/to/image.jpg',
  IMAGE_PRESETS.social.TWITTER    // 1200x630 Twitter用画像
);

// レスポンシブ画像（アスペクト比維持）
const responsiveImage = buildUrl(
  'your-cloud-name',
  'path/to/image.jpg',
  IMAGE_PRESETS.fit.MEDIUM        // 幅600px（アスペクト比維持）
);
```

## 利用可能なプリセット

### サムネイル用 (`IMAGE_PRESETS.thumbnail`)
- `SQUARE`: 150x150 の正方形サムネイル
- `LANDSCAPE`: 300x200 の横長サムネイル
- `PORTRAIT`: 200x300 の縦長サムネイル

### アスペクト比維持 (`IMAGE_PRESETS.fit`)
- `SMALL`: 幅300px（アスペクト比維持）
- `MEDIUM`: 幅600px（アスペクト比維持）
- `LARGE`: 幅1200px（アスペクト比維持）

### ソーシャルメディア用 (`IMAGE_PRESETS.social`)
- `TWITTER`: 1200x630 Twitter用画像
- `FACEBOOK`: 1200x630 Facebook用画像
- `INSTAGRAM`: 1080x1080 Instagram用画像

## カスタムプリセットの作成

プリセットオブジェクトを拡張して、独自のプリセットを追加できます。

```typescript
import { buildUrl } from '@estrivault/cloudinary-utils';

const CUSTOM_PRESETS = {
  HERO: { w: 1920, h: 1080, mode: 'fill' as const },
  CARD: { w: 400, h: 225, mode: 'fill' as const }
};

const heroImage = buildUrl('your-cloud-name', 'path/to/hero.jpg', CUSTOM_PRESETS.HERO);
```

## 開発

### セットアップ

```bash
pnpm install
```

### ビルド

```bash
pnpm build
```

### 開発モード

ファイルの変更を監視して自動的にビルドします。

```bash
pnpm dev
```

## ライセンス

MIT
