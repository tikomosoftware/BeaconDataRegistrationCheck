import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import {
  executeTidb,
  getBeaconTableName,
  queryTidbRows,
  toIsoString,
  toMysqlDateTime
} from "@/lib/tidb";

export const runtime = "nodejs";

const lifeCheckUuid = "00000000-0000-0000-0000-000000000000";
const selectColumns =
  "id, `date`, uuid, major, minor, comment, user_id, user_name, department, created_at";

type IBeaconDbRow = RowDataPacket & {
  id: string;
  date: Date | string;
  uuid: string;
  major: number;
  minor: number;
  comment: string | null;
  user_id: string | null;
  user_name: string | null;
  department: string | null;
  created_at: Date | string;
};

function serializeRecord(record: IBeaconDbRow) {
  return {
    id: record.id,
    date: toIsoString(record.date),
    uuid: record.uuid,
    major: record.major,
    minor: record.minor,
    comment: record.comment,
    user_id: record.user_id,
    user_name: record.user_name,
    department: record.department,
    created_at: toIsoString(record.created_at)
  };
}

function requireRecord(record: IBeaconDbRow | undefined) {
  if (!record) {
    throw new Error("Inserted row could not be loaded from TiDB");
  }

  return record;
}

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

  try {
    const tableName = getBeaconTableName();
    const id = randomUUID();
    const now = new Date();

    await executeTidb(
      `INSERT INTO ${tableName}
        (id, \`date\`, uuid, major, minor, comment, user_id, user_name, department, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        toMysqlDateTime(now),
        lifeCheckUuid,
        0,
        0,
        "daily life check",
        null,
        null,
        null,
        toMysqlDateTime(now)
      ]
    );

    const rows = await queryTidbRows<IBeaconDbRow[]>(
      `SELECT ${selectColumns}
       FROM ${tableName}
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({ ok: true, data: serializeRecord(requireRecord(rows[0])) });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errors: [error instanceof Error ? error.message : "TiDB request failed"]
      },
      { status: 500 }
    );
  }
}
