# タスク・機能リスト

## プロジェクト概要
GitHubのReleaseを簡単に作成できるWebサービス

## 技術スタック
- Next.js (frontend + backend)
- TypeScript
- Biome (lint, formatter)
- TailwindCSS

---

## フェーズ1: プロジェクトセットアップ
- [x] Next.jsプロジェクトの初期化
- [x] TypeScript設定
- [x] Biome設定
- [x] TailwindCSS設定
- [x] 環境変数設定 (GitHub Personal Access Token)

## フェーズ2: バックエンドAPI実装
- [x] GitHub API認証設定
- [x] リポジトリ一覧取得API (`GET /api/repositories`)
- [x] リポジトリのリリース情報取得API (`GET /api/repositories/[owner]/[repo]/releases`)
- [x] リリース作成API (`POST /api/repositories/[owner]/[repo]/releases`)
- [x] リリースノート自動生成API (generate_notes)

## フェーズ3: フロントエンド実装
- [ ] レイアウト・共通コンポーネント
- [ ] リポジトリ一覧ページ
  - [ ] リポジトリカード表示
  - [ ] 現在のバージョン表示
  - [ ] リリースからの経過日数表示
- [ ] リリース作成モーダル/ページ
  - [ ] バージョン入力フォーム
  - [ ] 次のバージョン自動計算
  - [ ] リリース作成ボタン

## フェーズ4: 仕上げ
- [ ] エラーハンドリング
- [ ] ローディング状態の表示
- [ ] UI/UXの改善

---

## 参考リンク
- [GitHub REST API - Releases](https://docs.github.com/ja/rest/releases/releases?apiVersion=2022-11-28)
