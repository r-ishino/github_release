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
cp <本体>/.env.local .   # GITHUB_TOKEN

pnpm exec next dev --port <port>
```

`.env.local` は gitignore 対象なので worktree には無い。本体クローンにも無ければ、`.env.local.example` を写して `GITHUB_TOKEN` を埋める。

## 他リポジトリとの対応

無し。外部の接続先は GitHub API だけ。

## 起動後の確認

- 起動ログの `Local:` が `<port>` になっているか(8880 なら本体と取り合っている)
- 起動ログの `Environments:` に `.env.local` が含まれているか。含まれていなければリポジトリ一覧の API が失敗する
- `http://localhost:<port>` でリポジトリ一覧が表示されるか

## 片付け

```bash
lsof -ti:<port> | xargs kill
rm -f AGENTS.md
git worktree remove <worktree>
```

AI エージェント(Claude Code 等)から `next dev` を起動すると、Next.js が未追跡の `AGENTS.md` を生成する。残っていると未コミットの差分として扱われ、`git worktree remove` が止まる。

## 分離されないもの

- GitHub 上のリリース — worktree の画面から作成したリリースも、実在するリポジトリに作られる。確認でリリース作成ボタンを押さない
- GitHub API のレート制限 — 同じトークンを使う全インスタンスで共有する
