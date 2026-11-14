# CLAUDE.md

このファイルはClaude Codeがこのプロジェクトを理解するためのガイドです。

## プロジェクト概要
GitHubのReleaseを簡単に作成できるWebサービス

## 技術スタック
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **Lint/Formatter**: Biome
- **スタイリング**: TailwindCSS v4
- **最適化**: React Compiler

## 環境変数
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth App の認証情報 (backend専用)
- `SESSION_SECRET`: セッション cookie の暗号化鍵 (backend専用、32 文字以上)

GitHub API はログインしたユーザーのトークンで呼ぶ。ブラウザは `localhost` ではなく `http://127.0.0.1:8880` で開く(OAuth App の callback がポート違いを許すのは 127.0.0.1 だけのため)。

## ディレクトリ構成
```
/
├── docs/              # ドキュメント・タスク管理
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── api/      # API Routes
│   │   └── ...       # Pages
│   ├── components/   # Reactコンポーネント
│   ├── lib/          # ユーティリティ・GitHub API クライアント
│   └── types/        # TypeScript型定義
├── CLAUDE.md
├── package.json
└── ...
```

## 開発コマンド
```bash
# 開発サーバー起動 (ポート8880)
pnpm dev

# Lint
pnpm lint

# Format
pnpm format
```

## 重要な実装方針
1. GitHub Tokenはフロントエンドに露出させない（APIルート経由で利用）
2. TailwindCSSは基本的な使い方に留める（学習目的）
3. タスク管理は `docs/tasks.md` で行う
4. **useCallback/useMemoは使用禁止** - React Compilerが自動最適化するため
5. 開発サーバーはポート8880を使用
6. **interfaceは使用禁止** - typeを使用すること
7. **function宣言は使用禁止** - アロー関数を使用すること

## セッション終了時の注意
**重要**: セッション終了時は必ず開発サーバーのプロセスを停止してください。
```bash
# ポート8880のプロセスを停止
lsof -ti:8880 | xargs kill -9
```
