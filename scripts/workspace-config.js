#!/usr/bin/env node

/**
 * ワークスペース設定の共通定義
 * パッケージ情報の重複を避けるための共有設定
 */
export const PACKAGES = [
  {
    name: '@estrivault/content-processor',
    path: 'packages/content-processor',
    distPath: 'packages/content-processor/dist'
  },
  {
    name: '@estrivault/cloudinary-utils', 
    path: 'packages/cloudinary-utils',
    distPath: 'packages/cloudinary-utils/dist'
  }
];