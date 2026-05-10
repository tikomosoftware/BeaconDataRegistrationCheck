# Beacon Data Registration Check

![version](https://img.shields.io/badge/version-0.2.0-blue)

iBeacon形式のデータを Next.js API Route 経由で Supabase に登録し、登録済みデータを画面上で確認するための技術検証用アプリです。

## Features

- iBeaconデータの登録フォーム
- APIリクエストとレスポンスの確認表示
- Supabaseテーブルに登録された最新データの一覧表示
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

`.env.local` にSupabaseの接続情報を設定します。

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_sec************
SUPABASE_IBEACON_TABLE=ibeacons
CRON_SECRET=************
```

`SUPABASE_SERVICE_ROLE_KEY` はSupabaseの `service_role key` です。ブラウザへ公開してはいけないため、必ずサーバー側の環境変数として設定してください。

## Supabase Table

SupabaseのSQL Editorで以下を実行します。

```sql
create table if not exists public.ibeacons (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null,
  uuid text not null,
  major integer not null,
  minor integer not null,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.ibeacons enable row level security;

grant usage on schema public to service_role;
grant insert, select on table public.ibeacons to service_role;
```

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
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_sec************
SUPABASE_IBEACON_TABLE=ibeacons
CRON_SECRET=************
```

Environment は最低限 `Production` に設定してください。Preview環境でも動作確認したい場合は `Preview` にも付けます。

### Environment Variable Notes

- `SUPABASE_URL`
  - Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY`
  - Supabaseの `service_role key`
  - `anon key` ではありません
  - 値の例: `sb_sec************`
- `SUPABASE_IBEACON_TABLE`
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

Supabase Free Plan projects may be paused when activity is low. This endpoint writes one lightweight row to the iBeacon table once per day through Vercel Cron.

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
