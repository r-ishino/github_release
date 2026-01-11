# CLAUDE.md

このファイルはClaude Codeがこのプロジェクトを理解するためのガイドです。

## プロジェクト概要
GitHubのReleaseを簡単に作成できるWebサービス

## 技術スタック
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **Lint/Formatter**: Biome
- **スタイリング**: TailwindCSS

## 環境変数
- `GITHUB_TOKEN`: GitHub Personal Access Token (backend専用)

## ディレクトリ構成 (予定)
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
# 開発サーバー起動
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
