import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const tableName = process.env.SUPABASE_IBEACON_TABLE ?? "ibeacons";
const lifeCheckUuid = "00000000-0000-0000-0000-000000000000";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, errors: ["CRON_SECRET is not set"] },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, errors: ["Unauthorized"] },
      { status: 401 }
    );
  }

  let supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>;

  try {
    supabaseAdmin = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errors: [error instanceof Error ? error.message : "Supabase is not set"]
      },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .insert({
      date: now,
      uuid: lifeCheckUuid,
      major: 0,
      minor: 0,
      comment: "daily life check"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, errors: [error.message] },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
