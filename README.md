# Beacon Data Registration Check

![version](https://img.shields.io/badge/version-0.2.0-blue)

iBeacon形式のデータを Next.js API Route 経由で TiDB Cloud に登録し、登録済みデータを画面上で確認するための技術検証用アプリです。

## Features

- iBeaconデータの登録フォーム
- APIリクエストとレスポンスの確認表示
- TiDBテーブルに登録された最新データの一覧表示
- テーブルヘッダーでのフィルタリング
- 日付カレンダーによる日付フィルタリング
- Vercel Cronによる1日1回のライフチェック登録
- UUIDの後半マスク表示

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` にTiDB Cloudの接続情報を設定します。

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
TIDB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=2jobXMThUBdFpBf.root
TIDB_PASSWORD=************
TIDB_DATABASE=beacon_info_stock
TIDB_IBEACON_TABLE=ibeacons
CRON_SECRET=************
```

`TIDB_PASSWORD` はTiDB Cloudで生成したパスワードです。ブラウザへ公開してはいけないため、必ずサーバー側の環境変数として設定してください。

## TiDB Table

TiDB CloudのSQL Editorで以下を実行します。

```sql
CREATE DATABASE IF NOT EXISTS beacon_info_stock;

USE beacon_info_stock;

CREATE TABLE IF NOT EXISTS ibeacons (
  id CHAR(36) PRIMARY KEY,
  `date` DATETIME(3) NOT NULL,
  uuid VARCHAR(64) NOT NULL,
  major INT NOT NULL,
  minor INT NOT NULL,
  comment TEXT NULL,
  user_id VARCHAR(255) NULL,
  user_name VARCHAR(255) NULL,
  department VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ibeacons_created_at (created_at)
);
```

TiDB Cloudの接続画面に表示される初期Databaseが `sys` の場合でも、アプリでは `sys` を使わず、上記の `beacon_info_stock` を使います。

## Vercel Deployment Settings

Vercelにデプロイする場合、対象プロジェクトの設定画面から環境変数を追加します。

場所:

```text
Vercel Dashboard
→ 対象プロジェクト
→ Project Settings
→ General
→ Environment Variables
```

設定する環境変数:

```env
TIDB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=2jobXMThUBdFpBf.root
TIDB_PASSWORD=************
TIDB_DATABASE=beacon_info_stock
TIDB_IBEACON_TABLE=ibeacons
CRON_SECRET=************
```

Environment は最低限 `Production` に設定してください。Preview環境でも動作確認したい場合は `Preview` にも付けます。

### Environment Variable Notes

- `TIDB_HOST`
  - TiDB CloudのHost
- `TIDB_PORT`
  - 通常は `4000`
- `TIDB_USER`
  - TiDB CloudのUsername
- `TIDB_PASSWORD`
  - TiDB Cloudで生成したパスワード
- `TIDB_DATABASE`
  - 通常は `beacon_info_stock`
  - `sys` は使いません
- `TIDB_IBEACON_TABLE`
  - 通常は `ibeacons`
- `CRON_SECRET`
  - Vercel Cronから `/api/ibeacons/lifecheck` を呼ぶための認証用文字列
  - 値の例: `nK01NeSdzAZs************`

環境変数を追加・変更した後は、Productionを再デプロイしてください。

## Vercel Cron Jobs

`vercel.json` で1日1回のCron Jobを設定しています。

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/ibeacons/lifecheck",
      "schedule": "0 18 * * *"
    }
  ]
}
```

確認場所:

```text
Vercel Dashboard
→ 対象プロジェクト
→ Project Settings
→ Cron Jobs
```

以下が表示されていればOKです。

```text
Path: /api/ibeacons/lifecheck
Schedule: 0 18 * * *
```

`0 18 * * *` は UTC 18:00、JSTでは毎日 03:00 です。

Cron Jobs画面に表示されない場合は、以下を確認してください。

- 最新の `main` ブランチがProductionにデプロイされているか
- `vercel.json` がリポジトリに含まれているか
- 環境変数設定後に再デプロイしたか
- 対象プロジェクトの `Project Settings > Cron Jobs` を見ているか

## API

### Register beacon data

`POST /api/ibeacons`

```json
{
  "date": "2026-05-07T12:00:00.000Z",
  "uuid": "74278bda-b644-4520-8f0c-720eaf059935",
  "major": 1,
  "minor": 2,
  "comment": "test"
}
```

### Fetch registered data

`GET /api/ibeacons`

最新20件の登録データを返します。レスポンス内のUUIDは後半がマスクされます。

```json
{
  "ok": true,
  "data": [
    {
      "uuid": "74278bda-b644-4520******************"
    }
  ]
}
```

### Daily life check

`GET /api/ibeacons/lifecheck`

This endpoint writes one lightweight row to the iBeacon table once per day through Vercel Cron.

Inserted row:

```json
{
  "uuid": "00000000-0000-0000-0000-000000000000",
  "major": 0,
  "minor": 0,
  "comment": "daily life check"
}
```

The endpoint requires this header:

```http
Authorization: Bearer <CRON_SECRET>
```

Without the matching secret, it returns `401`.
