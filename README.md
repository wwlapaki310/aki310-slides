# 🎪 Slidev Multi-Presentation System

複数のSlidevプレゼンテーションを1つのリポジトリで効率的に管理・デプロイできるシンプルなシステムです。

## ✨ 特徴

- 📊 **統一管理**: 1つのリポジトリで複数のスlidevプレゼンテーションを管理
- 🚀 **自動デプロイ**: Vercelでの自動ビルド・デプロイ
- 🔍 **検索機能**: タイトルや内容での検索
- 📱 **レスポンシブ**: モバイル対応のクリーンなUI
- 🎨 **プレビュー生成**: 各スライドの自動プレビュー画像生成

## 🏗️ システム構成

```
├── slides/
│   ├── presentation-1/
│   │   └── src/          # Slidev プロジェクト
│   └── presentation-2/
│       └── src/          # Slidev プロジェクト
├── scripts/
│   ├── build-index.js           # インデックスページ生成
│   ├── generate-previews.js     # プレビュー画像生成
│   ├── create-slide.js          # 新規スライド作成
│   └── slide-metadata.json     # スライドメタデータ
├── dist/                        # ビルド出力先
└── vercel.json                  # Vercel設定
```

## 🚀 セットアップ

### 1. このリポジトリをフォーク

```bash
# GitHubでフォークしてクローン
git clone https://github.com/your-username/aki310-slides.git
cd aki310-slides
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 新しいスライドの作成

```bash
npm run create-slide
```

対話的に以下を入力:
- スライド名 (ディレクトリ名)
- タイトル
- 説明
- カテゴリなど

### 4. スライドの開発

```bash
# 特定のスライドの開発サーバー起動
cd slides/your-slide-name/src
npm run dev
```

### 5. ビルドとプレビュー生成

```bash
# 全体のビルド
npm run build

# プレビュー画像生成
npm run generate-previews
```

## 📝 スライドの追加方法

### 手動で追加する場合

1. `slides/` ディレクトリに新しいフォルダを作成
2. `src/` サブディレクトリを作成
3. 通常のSlidevプロジェクトとしてセットアップ
4. `scripts/slide-metadata.json` にメタデータを追加
5. `package.json` のスクリプトを更新

### 自動作成スクリプトを使用する場合

```bash
npm run create-slide
```

## 🎨 カスタマイズ

### スタイルの変更

`scripts/build-index.js` 内のHTMLテンプレートとCSSを編集してください。

### メタデータの追加

`scripts/slide-metadata.json` でスライドの情報を管理:

```json
{
  "slides": [
    {
      "name": "slide-directory-name",
      "title": "スライドタイトル",
      "description": "スライドの説明",
      "date": "2025-07-19",
      "author": "作成者名",
      "category": "tech-talk",
      "duration": "15分",
      "level": "intermediate",
      "language": "ja"
    }
  ]
}
```

## 🚀 デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに接続
2. ビルド設定は `vercel.json` に定義済み
3. プッシュすると自動でデプロイされます

## 📋 利用可能なコマンド

```bash
# 全体のビルド
npm run build

# 特定のスライドのビルド
npm run build:slide-name

# インデックスページの生成
npm run build:index

# プレビュー画像の生成
npm run build:previews

# 新しいスライドの作成
npm run create-slide

# 特定のスライドの開発
npm run dev:slide-name
```

## 🛠️ 技術スタック

- **Slidev** v0.52.0 - プレゼンテーション作成
- **Vue.js** 3.4+ - フロントエンド
- **Vercel** - ホスティング
- **Playwright** - プレビュー画像生成
- **Tailwind CSS** - スタイリング

## 📁 ディレクトリ構造詳細

```
├── slides/                      # 各プレゼンテーションのフォルダ
│   └── slide-name/
│       └── src/                 # Slidevプロジェクト本体
│           ├── slides.md        # スライド内容
│           ├── package.json     # Slidev設定
│           └── ...
├── scripts/                     # ビルドスクリプト
├── dist/                        # ビルド出力
│   ├── index.html              # メインインデックス
│   ├── slide-name/             # 各スライドのビルド結果
│   └── previews/               # プレビュー画像
└── vercel.json                 # Vercel設定
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👤 作者

**Satoru Akita**

- GitHub: [@wwlapaki310](https://github.com/wwlapaki310)

---

🎪 **Happy Presenting with Slidev!**
