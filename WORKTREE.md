# WORKTREE.md

<!-- このファイルがあるリポジトリは git worktree での並列起動に対応している。
     見出し構成は全リポジトリ共通。<slug> / <port> は呼び出し側が採番する。 -->

## 対応状況

| 項目 | 値 |
|---|---|
| 並列起動 | 可 |
| worktree ごとに増えるもの | dev サーバー 1 プロセスとビルドキャッシュ(`.next`)、`node_modules` |
| 主なコスト | ディスク。worktree ごとに `pnpm install` が要る |

DB もコンテナも持たないので、起動するのは Next.js の dev サーバーだけ。

## 分離のしくみ

| 分離するもの | 分け方 | 設定 |
|---|---|---|
| dev サーバーのポート | `next dev --port` に渡す | 起動コマンドの引数 |
| ビルドキャッシュ・node_modules | worktree ディレクトリ | 不要(自動) |
| お気に入り | ブラウザの `localStorage`(origin ごと) | 不要(ポートが違えば別になる) |

`pnpm dev` は `--port 8880` を固定で渡すので、worktree では `pnpm exec next dev --port <port>` で起動する。`PORT` 環境変数は `--port` 指定に負けるため効かない。

## 起動手順

```bash
cd <worktree>

pnpm install
cp <本体>/.env.local .   # GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / SESSION_SECRET

pnpm exec next dev --port <port>
```

`.env.local` は gitignore 対象なので worktree には無い。本体クローンにも無ければ、`.env.local.example` を写して値を埋める。

OAuth App の callback URL は `http://127.0.0.1/api/auth/callback` で登録してあり、127.0.0.1 ならポートを問わず戻れる。そのため worktree でも同じ OAuth App でログインできる。

## 他リポジトリとの対応

無し。外部の接続先は GitHub API だけ。

## 起動後の確認

- 起動ログの `Local:` が `<port>` になっているか(8880 なら本体と取り合っている)
- 起動ログの `Environments:` に `.env.local` が含まれているか。含まれていなければログインで失敗する
- `http://127.0.0.1:<port>` でログインし、リポジトリ一覧が表示されるか

## 片付け

```bash
lsof -ti:<port> | xargs kill
git worktree remove <worktree>
```

## 分離されないもの

- ログイン状態 — cookie はポートを区別しないため、127.0.0.1 の全インスタンスで共有する。ログアウトも全部に効く
- GitHub 上のリリース — worktree の画面から作成したリリースも、実在するリポジトリに作られる。確認でリリース作成ボタンを押さない
- GitHub API のレート制限 — 同じトークンを使う全インスタンスで共有する
