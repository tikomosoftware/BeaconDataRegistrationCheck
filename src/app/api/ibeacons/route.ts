import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type IBeaconRequestBody = {
  date?: unknown;
  uuid?: unknown;
  major?: unknown;
  minor?: unknown;
  comment?: unknown;
};

const tableName = process.env.SUPABASE_IBEACON_TABLE ?? "ibeacons";

function toInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }

  return null;
}

function validateBody(body: IBeaconRequestBody) {
  const errors: string[] = [];
  const date = typeof body.date === "string" ? body.date : "";
  const uuid = typeof body.uuid === "string" ? body.uuid.trim() : "";
  const major = toInteger(body.major);
  const minor = toInteger(body.minor);
  const comment =
    typeof body.comment === "string" && body.comment.trim() !== ""
      ? body.comment.trim()
      : null;

  if (!date || Number.isNaN(Date.parse(date))) {
    errors.push("date must be an ISO date string");
  }

  if (!uuid) {
    errors.push("uuid is required");
  }

  if (major === null) {
    errors.push("major must be an integer");
  }

  if (minor === null) {
    errors.push("minor must be an integer");
  }

  if (errors.length > 0) {
    return { ok: false as const, errors };
  }

  return {
    ok: true as const,
    value: {
      date: new Date(date).toISOString(),
      uuid,
      major: major as number,
      minor: minor as number,
      comment
    }
  };
}

export async function GET() {
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

  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select("id,date,uuid,major,minor,comment,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { ok: false, errors: [error.message] },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request: NextRequest) {
  let body: IBeaconRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["request body must be valid JSON"] },
      { status: 400 }
    );
  }

  const validation = validateBody(body);

  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, errors: validation.errors },
      { status: 400 }
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

  const { data, error } = await supabaseAdmin
    .from(tableName)
    .insert(validation.value)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, errors: [error.message] },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
