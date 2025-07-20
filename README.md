# 🎪 Slidev Multi-Presentation System

複数のSlidevプレゼンテーションを1つのリポジトリで効率的に管理・デプロイできるシンプルなシステムです。

## ✨ 特徴

- 📊 **統一管理**: 1つのリポジトリで複数のslidevプレゼンテーションを管理
- 🚀 **自動デプロイ**: Vercelでの自動ビルド・デプロイ
- 🔍 **検索機能**: タイトルや内容での検索
- 🏷️ **タグシステム**: プレゼンテーションの分類・フィルタリング機能
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
├── config/
│   └── slides-metadata.js      # スライドメタデータ設定
├── manage-tags.html             # タグ管理ページ
├── assign-tags.html             # タグ割り当てページ
├── dist/                        # ビルド出力先
└── vercel.json                  # Vercel設定
```

## 🏷️ タグシステム

### タグ管理機能
- **タグ作成・編集・削除**: `manage-tags.html`でタグを管理
- **カラーリング**: 8色から選択可能（Blue, Green, Red, Yellow, Purple, Pink, Indigo, Gray）
- **永続化**: LocalStorageを使用してタグ情報を保存
- **使用状況確認**: どのスライドで使用されているかを確認

### タグ割り当て機能
- **個別割り当て**: `assign-tags.html`で各スライドにタグを個別に割り当て
- **一括操作**: 複数のスライドに同時にタグを追加・削除
- **リアルタイム編集**: 変更がリアルタイムでプレビューに反映
- **メタデータ更新**: 変更をJavaScriptファイルとしてエクスポート

### フィルタリング機能
- **タグフィルタ**: メインページでタグによるフィルタリング
- **テキスト検索**: タイトルや説明での検索
- **組み合わせ検索**: タグとテキスト検索の組み合わせ
- **結果カウンタ**: フィルタ結果の件数表示

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
- カテゴリ
- タグ (作成済みのタグから選択)

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

## 🏷️ タグシステムの使用方法

### 1. タグの作成・管理

1. `manage-tags.html`にアクセス
2. 「新しいタグを作成」フォームでタグを追加
3. タグ名、カラー、説明を設定
4. 既存タグの編集・削除も可能

### 2. スライドへのタグ割り当て

1. `assign-tags.html`にアクセス
2. 各スライドに表示される「タグを追加」エリアからタグを選択
3. 不要なタグは「×」ボタンで削除
4. 一括操作で複数のスライドに同時にタグを適用
5. 「変更を保存」で新しいメタデータファイルをダウンロード
6. ダウンロードしたファイルを`config/slides-metadata.js`に置き換え

### 3. タグによるフィルタリング

1. メインページの「Filter & Search」セクションを使用
2. タグをクリックしてフィルタを適用
3. 検索ボックスでテキスト検索
4. 「Clear All Filters」ですべてのフィルタをリセット

### 4. タグデータの永続化

タグシステムは以下の方法でデータを永続化します：

#### LocalStorageによる一時保存
- ブラウザのLocalStorageにタグ定義を保存
- タグの作成・編集・削除が即座に反映
- ブラウザ間での同期は不要（個人使用のため）

#### ファイルによる永続化
- `config/slides-metadata.js`: スライドとタグの関連付け
- タグ割り当て変更時にファイルをダウンロード
- 手動でリポジトリに反映してデプロイ

## 📝 スライドの追加方法

### 手動で追加する場合

1. `slides/` ディレクトリに新しいフォルダを作成
2. `src/` サブディレクトリを作成
3. 通常のSlidevプロジェクトとしてセットアップ
4. `config/slides-metadata.js` にメタデータを追加
5. `package.json` のスクリプトを更新

### 自動作成スクリプトを使用する場合

```bash
npm run create-slide
```

## 🎨 カスタマイズ

### スタイルの変更

`scripts/build-index.js` 内のHTMLテンプレートとCSSを編集してください。

### メタデータの追加

`config/slides-metadata.js` でスライドの情報を管理:

```json
{
  "name": "slide-directory-name",
  "title": "スライドタイトル",
  "description": "スライドの説明",
  "date": "2025-07-19",
  "author": "作成者名",
  "category": "tech-talk",
  "duration": "15分",
  "level": "intermediate",
  "language": "ja",
  "tags": ["default-tech", "sre", "conference"]
}
```

### タグカラーのカスタマイズ

`scripts/build-index.js` 内のCSSスタイルでタグの色を変更可能:

```css
.tag.custom-tag {
  background-color: #f0f9ff;
  color: #0369a1;
}
```

## 🚀 デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに接続
2. ビルド設定は `vercel.json` に定義済み
3. プッシュすると自動でデプロイされます

### タグシステムのデプロイ注意点

- LocalStorageのタグ情報は各環境で個別に管理
- `config/slides-metadata.js`の変更は手動でコミット・プッシュが必要
- 本番環境でのタグ管理は管理者が責任を持って実施

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
- **Alpine.js** - タグ管理UI
- **LocalStorage** - クライアントサイドデータ永続化

## 📁 ディレクトリ構造詳細

```
├── slides/                      # 各プレゼンテーションのフォルダ
│   └── slide-name/
│       └── src/                 # Slidevプロジェクト本体
│           ├── slides.md        # スライド内容
│           ├── package.json     # Slidev設定
│           └── ...
├── scripts/                     # ビルドスクリプト
├── config/                      # 設定ファイル
│   └── slides-metadata.js       # スライドメタデータ
├── manage-tags.html             # タグ管理ページ
├── assign-tags.html             # タグ割り当てページ
├── dist/                        # ビルド出力
│   ├── index.html              # メインインデックス
│   ├── slide-name/             # 各スライドのビルド結果
│   └── previews/               # プレビュー画像
└── vercel.json                 # Vercel設定
```

## 🔧 トラブルシューティング

### タグが表示されない場合
1. ブラウザのLocalStorageを確認
2. `manage-tags.html`でタグが正しく作成されているか確認
3. `config/slides-metadata.js`にタグIDが正しく設定されているか確認

### フィルタリングが動作しない場合
1. JavaScriptコンソールでエラーをチェック
2. タグIDの大文字小文字を確認
3. ブラウザのキャッシュをクリア

### メタデータの変更が反映されない場合
1. `assign-tags.html`で変更を保存
2. ダウンロードしたファイルを正しいパスに配置
3. ビルドを再実行

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