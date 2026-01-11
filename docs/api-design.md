# API設計

## 概要
GitHub Personal Access Tokenを使用してGitHub APIと通信するバックエンドAPI。
トークンはサーバーサイドでのみ使用し、フロントエンドには露出させない。

## 環境変数
- `GITHUB_TOKEN`: GitHub Personal Access Token (必須スコープ: `repo`)

---

## エンドポイント一覧

### 1. リポジトリ一覧取得
```
GET /api/repositories
```

**レスポンス:**
```json
[
  {
    "id": 123456,
    "name": "repo-name",
    "full_name": "owner/repo-name",
    "owner": "owner",
    "description": "Repository description",
    "private": false,
    "html_url": "https://github.com/owner/repo-name",
    "latest_release": {
      "tag_name": "v1.2.3",
      "published_at": "2024-01-15T10:00:00Z",
      "days_since_release": 30
    }
  }
]
```

**GitHub API:**
- `GET https://api.github.com/user/repos`
- `GET /repos/{owner}/{repo}/releases/latest` (各リポジトリ)

---

### 2. リポジトリのリリース一覧取得
```
GET /api/repositories/[owner]/[repo]/releases
```

**レスポンス:**
```json
{
  "repository": {
    "full_name": "owner/repo-name"
  },
  "releases": [
    {
      "id": 789,
      "tag_name": "v1.2.3",
      "name": "Release v1.2.3",
      "body": "Release notes...",
      "draft": false,
      "prerelease": false,
      "published_at": "2024-01-15T10:00:00Z",
      "html_url": "https://github.com/owner/repo-name/releases/tag/v1.2.3"
    }
  ],
  "next_version": "v1.2.4"
}
```

**GitHub API:**
- `GET /repos/{owner}/{repo}/releases`

---

### 3. リリース作成
```
POST /api/repositories/[owner]/[repo]/releases
```

**リクエストボディ:**
```json
{
  "tag_name": "v1.2.4",
  "name": "Release v1.2.4",
  "target_commitish": "main",
  "draft": false,
  "prerelease": false,
  "generate_notes": true
}
```

**レスポンス:**
```json
{
  "id": 790,
  "tag_name": "v1.2.4",
  "name": "Release v1.2.4",
  "body": "Auto-generated release notes...",
  "html_url": "https://github.com/owner/repo-name/releases/tag/v1.2.4"
}
```

**GitHub API:**
- `POST /repos/{owner}/{repo}/releases/generate-notes` (リリースノート生成)
- `POST /repos/{owner}/{repo}/releases` (リリース作成)

---

## バージョン自動計算ロジック

現在のバージョンから次のバージョンを計算する：

| 現在 | パッチ増加 |
|------|-----------|
| v1.2.3 | v1.2.4 |
| 1.2.3 | 1.2.4 |
| v1.0.0 | v1.0.1 |

※ セマンティックバージョニング (major.minor.patch) を前提とする

---

## 参考リンク
- [GitHub REST API - Repositories](https://docs.github.com/en/rest/repos)
- [GitHub REST API - Releases](https://docs.github.com/ja/rest/releases/releases?apiVersion=2022-11-28)
