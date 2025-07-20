# 🎪 Slidev Multi-Presentation System

複数のSlidevプレゼンテーションを1つのリポジトリで効率的に管理・デプロイできるシンプルなシステムです。

## ✨ 特徴

- 📊 **統一管理**: 1つのリポジトリで複数のslidevプレゼンテーションを管理
- 🚀 **自動デプロイ**: Vercelでの自動ビルド・デプロイ
- 🔍 **検索機能**: タイトルや内容での検索
- 🏷️ **スマートタグシステム**: GitHub Gist連携による自動永続化
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
│   └── build-index.js           # インデックスページ生成
├── js/
│   ├── gist-api.js              # GitHub Gist API wrapper
│   ├── tag-manager.js           # タグ管理ロジック
│   └── slide-filter.js          # フィルタリング機能
├── config/
│   └── slides-metadata.js      # スライドメタデータ設定
├── dist/                        # ビルド出力先
└── vercel.json                  # Vercel設定
```

## 🏷️ 革新的なタグシステム

### 🎯 設計コンセプト
従来の複雑な管理ページや手動ファイル操作を排除し、**GitHub Gist API**を活用した完全自動化システムを実現。

### 🔄 自動永続化の仕組み

#### データフロー
```
[ユーザー操作] 
    ↓
[TagManager] ← → [LocalStorage (即座)]
    ↓ (1秒後の自動保存)
[GistAPI] 
    ↓
[GitHub Gist (クラウド同期)]
```

#### ストレージ戦略
- **Primary**: GitHub Gist (プライベート、無制限、全環境同期)
- **Fallback**: LocalStorage (オフライン対応、デバイス固有)
- **Sync**: Personal Access Token認証による自動同期

### 📊 データ構造

#### GitHub Gistに保存されるJSON形式
```json
{
  "tags": {
    "tech": {
      "name": "Tech",
      "color": "blue", 
      "createdAt": "2025-07-20T12:00:00Z"
    },
    "business": {
      "name": "Business",
      "color": "green",
      "createdAt": "2025-07-20T12:05:00Z"
    }
  },
  "assignments": {
    "sre-next-2025": ["tech", "sre"],
    "slidev-system": ["tech", "business", "tools"]
  },
  "lastUpdated": "2025-07-20T12:10:00Z",
  "version": "1.0"
}
```

### 🎮 ユーザーインターフェース

#### ワンページ完結設計
- **統合UI**: 全機能をメインページに集約
- **インライン編集**: スライドカード内でのダイレクト編集
- **自動セットアップ**: GitHub設定ガイドによる簡単初期化
- **リアルタイム反映**: 変更の即座な視覚化

#### インタラクション設計
1. **初回設定**: ⚙️ボタンからGitHub Tokenを設定
2. **タグ作成**: スライドカードの「+ Add Tag」ボタン
3. **タグ削除**: タグをクリックして削除
4. **フィルタリング**: タグクリックによる即座フィルタ
5. **検索**: テキスト + タグフィルタの組み合わせ

### 🔧 技術仕様

#### Core Technologies
- **GitHub Gist API**: RESTful API (v3)
- **Authentication**: Personal Access Token (gist scope)
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Storage**: Dual-layer (Gist + LocalStorage)

#### 新機能 (v2.0)
- **自動Gist作成**: 初回タグ追加時に自動でGistを作成
- **改善されたエラーハンドリング**: 分かりやすいエラーメッセージとガイダンス
- **強化されたUI**: ステップバイステップの設定ガイド
- **接続状態表示**: リアルタイムでの接続状況確認

#### API Rate Limiting
- **GitHub API Limit**: 5,000 requests/hour (認証済み)
- **Auto-save Strategy**: デバウンス処理 (1秒間隔)
- **Batch Operations**: 複数変更の自動まとめ

#### Error Handling
- **Network Errors**: LocalStorageフォールバック
- **Authentication Errors**: ユーザー通知 + ローカル継続
- **Data Conflicts**: Last-write-wins戦略

## 🚀 クイックスタート

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

### 4. ビルドとデプロイ

```bash
# 全体のビルド
npm run build

# プレビュー画像生成
npm run generate-previews
```

## 🏷️ タグシステムの使用方法

### 🔧 初回セットアップ（2分で完了）

1. **メインページにアクセス**してサイトを開く
2. **⚙️ボタンをクリック**（右上角）して設定パネルを開く
3. **GitHub Personal Access Tokenを作成**:
   - [GitHub Settings > Tokens](https://github.com/settings/tokens) にアクセス
   - 「Generate new token (classic)」をクリック
   - **Scopes**: `gist` にチェックを入れる
   - 「Generate token」でトークンを作成・コピー
4. **トークンを設定**:
   - 設定パネルにトークンを貼り付け
   - 「Save & Connect」をクリック
   - 「Test」ボタンで接続確認

> ✅ **完了！** これでタグシステムが使用可能になりました

### 📝 タグの使用方法

#### タグの追加
1. スライドカードの **「+ Add Tag」** ボタンをクリック
2. タグ名を入力（例: "Tech", "Business", "Demo"）
3. **自動で保存されます** - Gistがない場合は自動作成

#### タグの削除
- タグをクリック → 削除確認 → 自動保存

#### 検索・フィルタリング
- **テキスト検索**: 上部の検索バーを使用
- **タグフィルタ**: タグをクリックしてフィルタリング
- **組み合わせ**: テキスト + タグフィルタの同時使用可能

### 🔄 データ同期

#### 自動保存プロセス
1. **即座反映**: UI上で変更が即座に表示
2. **デバウンス**: 1秒後に自動保存実行
3. **クラウド同期**: GitHub Gistに保存
4. **エラー処理**: 失敗時はローカルで継続

#### 環境間同期
- **同じToken使用**: 複数デバイスで同じトークンを設定
- **自動同期**: ページ読み込み時に最新データを取得
- **競合解決**: 最後の更新が優先される方式

### 💡 便利な機能

#### オフライン対応
- **ネット接続不要**: GitHubなしでもタグ機能が使用可能
- **自動復旧**: 接続復旧時に自動でGistと同期
- **データ保護**: ローカルデータは常に保持

#### 設定状況の確認
- **接続ステータス**: 設定パネルで現在の状況を確認
- **色分け表示**: ✅ 接続済み / ❌ 未接続 / ⚠️ エラー
- **トラブルシューティング**: 問題時の対処法を表示

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

### Core Technologies
- **Slidev** v0.52.0 - プレゼンテーション作成
- **Vue.js** 3.4+ - フロントエンド
- **Vercel** - ホスティング
- **Playwright** - プレビュー画像生成
- **Tailwind CSS** - スタイリング

### Tag System Technologies
- **GitHub Gist API** - クラウドストレージ
- **Personal Access Token** - セキュア認証
- **Vanilla JavaScript** - 軽量実装
- **LocalStorage** - オフライン対応
- **Debouncing** - パフォーマンス最適化

## 🔧 トラブルシューティング

### GitHub連携関連

#### ❌ 接続エラー
**症状**: 「Connection failed」と表示される
**解決方法**: 
1. [Personal Access Token](https://github.com/settings/tokens)を再確認
2. `gist` scopeが有効か確認
3. トークンの有効期限をチェック
4. ネットワーク接続を確認

#### ⚠️ レート制限
**症状**: 「API rate limit exceeded」エラー
**解決方法**:
1. しばらく待ってから再試行（1時間で5,000リクエスト制限）
2. 一時的にローカルストレージのみで作業
3. 不要なページ更新を避ける

### データ関連

#### 🏷️ タグが表示されない
**解決方法**:
1. ブラウザのコンソールでエラーをチェック（F12）
2. ⚙️ボタンから「Test」で接続確認
3. ページを再読み込み

#### 🔍 フィルタリングが動作しない
**解決方法**:
1. ページを再読み込み
2. ブラウザキャッシュをクリア
3. 「Clear Filters」ボタンを使用

#### 🔄 同期ができない
**解決方法**:
1. ネットワーク接続を確認
2. [GitHub Status](https://status.github.com)で障害情報をチェック
3. ⚙️から再度接続テストを実行

## 🚀 デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに接続
2. ビルド設定は `vercel.json` に定義済み
3. プッシュすると自動でデプロイされます

### カスタムドメイン
Vercelダッシュボードからカスタムドメインを設定可能です。

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

🎪 **Happy Presenting with Slidev + Smart Tags!**