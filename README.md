# Beacon Data Registration Check

iBeacon形式のデータをNext.jsのAPI Route経由でSupabaseへ登録し、登録済みデータを画面上で確認するための技術検証用アプリです。

## Features

- iBeaconデータの登録フォーム
- APIリクエストとレスポンスの確認表示
- Supabaseテーブルに登録された最新データの一覧表示
- テーブルヘッダーでのフィルタリング
- 日付カレンダーによる日付フィルタリング
- Vercel Cronによる1日1回のライフチェック登録

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` にSupabaseの接続情報を設定します。

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
SUPABASE_IBEACON_TABLE=ibeacons
CRON_SECRET=replace-with-a-random-secret
```

## Supabase Table

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

最新20件の登録データを返します。

### Daily life check

`GET /api/ibeacons/lifecheck`

Supabase Free Plan projects may be paused when activity is low. This endpoint writes one lightweight row to the iBeacon table once per day through Vercel Cron.

- Schedule: `0 18 * * *` (daily at 18:00 UTC / 03:00 JST)
- Inserted row: `uuid=00000000-0000-0000-0000-000000000000`, `major=0`, `minor=0`, `comment=daily life check`

Set `CRON_SECRET` in Vercel Project Settings > Environment Variables. Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the cron job. The endpoint returns `401` without the matching secret.

## Vercel Cron

`vercel.json` configures the daily cron job.

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
