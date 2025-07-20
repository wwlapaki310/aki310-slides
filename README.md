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
    ↓ (2秒後の自動保存)
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
      "description": "技術系の発表",
      "createdAt": "2025-07-20T12:00:00Z"
    },
    "business": {
      "name": "Business",
      "color": "green",
      "description": "ビジネス系の発表", 
      "createdAt": "2025-07-20T12:05:00Z"
    }
  },
  "assignments": {
    "sre-next-2025": ["tech", "sre"],
    "slidev-system": ["tech", "business", "tools"]
  },
  "lastUpdated": "2025-07-20T12:10:00Z"
}
```

### 🎮 ユーザーインターフェース

#### ワンページ完結設計
- **統合UI**: 全機能をメインページに集約
- **インライン編集**: スライドカード内でのダイレクト編集
- **モーダル編集**: 直感的なチェックボックス操作
- **リアルタイム反映**: 変更の即座な視覚化

#### インタラクション設計
1. **タグ作成**: メインページ上部の入力フィールド
2. **タグ編集**: 各スライドの"Edit Tags"ボタン
3. **フィルタリング**: タグクリックによる即座フィルタ
4. **検索**: テキスト + タグフィルタの組み合わせ

### 🔧 技術仕様

#### Core Technologies
- **GitHub Gist API**: RESTful API (v3)
- **Authentication**: Personal Access Token (gist scope)
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Storage**: Dual-layer (Gist + LocalStorage)

#### API Rate Limiting
- **GitHub API Limit**: 5,000 requests/hour (認証済み)
- **Auto-save Strategy**: デバウンス処理 (2秒間隔)
- **Batch Operations**: 複数変更の自動まとめ

#### Error Handling
- **Network Errors**: LocalStorageフォールバック
- **Authentication Errors**: ユーザー通知 + ローカル継続
- **Data Conflicts**: Last-write-wins戦略

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

### 3. GitHub Gist連携設定（推奨）

1. [GitHub Personal Access Token](https://github.com/settings/tokens)を作成
   - Scope: `gist` (必須)
   - Expiration: お好みで設定
2. メインページの「Settings」ボタンをクリック
3. Tokenを入力して「Save Configuration」
4. 「Test Connection」で接続確認

> **Note**: Token設定は任意です。設定しない場合はLocalStorageのみで動作します。

### 4. 新しいスライドの作成

```bash
npm run create-slide
```

### 5. ビルドとデプロイ

```bash
# 全体のビルド
npm run build

# プレビュー画像生成
npm run generate-previews
```

## 🏷️ タグシステムの使用方法

### 1. 初回セットアップ（推奨）

1. メインページにアクセス
2. ヘッダーの「Settings」ボタンをクリック
3. GitHub Personal Access Tokenを入力
4. 「Save Configuration」→「Test Connection」で確認

### 2. タグの作成・管理

#### 新しいタグの作成
1. 「Tag Management」セクションの入力フィールドに名前を入力
2. 「Add Tag」ボタンをクリック
3. 自動的にランダムカラーが割り当てられます

#### タグの削除
1. タグ一覧の「×」ボタンをクリック
2. 確認ダイアログで削除を確定
3. 関連付けられたスライドからも自動削除

### 3. スライドへのタグ割り当て

#### インライン編集
1. 各スライドカードの「Edit Tags」をクリック
2. モーダルでチェックボックスを操作
3. 「Save Changes」で確定

#### ワンクリックフィルタ
- スライドのタグをクリック → 即座にフィルタ適用
- フィルタバーのタグをクリック → ON/OFF切り替え

### 4. 検索・フィルタリング

#### 組み合わせ検索
- **テキスト検索**: タイトル・説明での部分一致
- **タグフィルタ**: 複数タグのAND/OR検索
- **リアルタイム**: 入力と同時に結果更新

#### フィルタのクリア
- 「Clear All Filters」ボタンで一括リセット
- 個別タグクリックでON/OFF切り替え

## 🔄 データ同期の仕組み

### 自動保存プロセス
1. **変更検知**: DOM操作やユーザーアクション
2. **デバウンス**: 2秒間の待機（連続変更の集約）
3. **LocalStorage**: 即座にローカル保存（UX向上）
4. **Gist Sync**: バックグラウンドでクラウド同期
5. **エラー処理**: 失敗時はローカルデータ保持

### 環境間同期
- **Token共有**: 同じTokenを複数環境で使用
- **即座同期**: ページロード時に最新データを取得
- **競合解決**: Last-write-wins方式

### オフライン対応
- **完全機能**: ネット接続なしでも全機能利用可能
- **自動復旧**: 接続復旧時に自動的にGistと同期
- **データ保護**: ローカルデータは常に保持

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

#### トークンエラー
```
GitHub API Error: 401 - Bad credentials
```
**解決方法**: 
1. [Personal Access Token](https://github.com/settings/tokens)を再確認
2. `gist` scopeが有効か確認
3. トークンの有効期限をチェック

#### レート制限
```
GitHub API Error: 403 - API rate limit exceeded
```
**解決方法**:
1. しばらく待ってから再試行（1時間で5,000リクエスト制限）
2. 自動保存の頻度を調整
3. 一時的にローカルストレージのみで作業

### データ関連

#### タグが表示されない
1. ブラウザのコンソールでエラーをチェック
2. LocalStorageの内容を確認：`localStorage.getItem('tag-data')`
3. Gist接続状況を「Test Connection」で確認

#### フィルタリングが動作しない
1. ページを再読み込み
2. JavaScriptエラーをコンソールで確認
3. ブラウザキャッシュをクリア

#### 同期ができない
1. ネットワーク接続を確認
2. GitHubの状態をチェック（status.github.com）
3. 「Settings」から再度接続テスト

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