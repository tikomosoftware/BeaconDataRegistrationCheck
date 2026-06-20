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

type IBeaconRequestBody = {
  date?: unknown;
  uuid?: unknown;
  major?: unknown;
  minor?: unknown;
  comment?: unknown;
  userId?: unknown;
  userName?: unknown;
  department?: unknown;
};

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

type IBeaconRecord = {
  id: string;
  date: string;
  uuid: string;
  major: number;
  minor: number;
  comment: string | null;
  user_id: string | null;
  user_name: string | null;
  department: string | null;
  created_at: string;
};

const selectColumns =
  "id, `date`, uuid, major, minor, comment, user_id, user_name, department, created_at";

function maskUuid(value: string) {
  const trimmedValue = value.trim();
  const visibleLength = 18;

  if (trimmedValue.length <= visibleLength) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, visibleLength)}******************`;
}

function maskRecordUuid<T extends { uuid?: unknown }>(record: T) {
  if (typeof record.uuid !== "string") {
    return record;
  }

  return {
    ...record,
    uuid: maskUuid(record.uuid)
  };
}

function serializeRecord(record: IBeaconDbRow): IBeaconRecord {
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
  const userId =
    typeof body.userId === "string" && body.userId.trim() !== ""
      ? body.userId.trim()
      : null;
  const userName =
    typeof body.userName === "string" && body.userName.trim() !== ""
      ? body.userName.trim()
      : null;
  const department =
    typeof body.department === "string" && body.department.trim() !== ""
      ? body.department.trim()
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
      date: new Date(date),
      uuid,
      major: major as number,
      minor: minor as number,
      comment,
      user_id: userId,
      user_name: userName,
      department
    }
  };
}

export async function GET() {
  try {
    const tableName = getBeaconTableName();
    const rows = await queryTidbRows<IBeaconDbRow[]>(
      `SELECT ${selectColumns}
       FROM ${tableName}
       ORDER BY created_at DESC
       LIMIT ?`,
      [20]
    );

    return NextResponse.json({
      ok: true,
      data: rows.map(serializeRecord).map(maskRecordUuid)
    });
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

  try {
    const tableName = getBeaconTableName();
    const id = randomUUID();
    const createdAt = new Date();

    await executeTidb(
      `INSERT INTO ${tableName}
        (id, \`date\`, uuid, major, minor, comment, user_id, user_name, department, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        toMysqlDateTime(validation.value.date),
        validation.value.uuid,
        validation.value.major,
        validation.value.minor,
        validation.value.comment,
        validation.value.user_id,
        validation.value.user_name,
        validation.value.department,
        toMysqlDateTime(createdAt)
      ]
    );

    const rows = await queryTidbRows<IBeaconDbRow[]>(
      `SELECT ${selectColumns}
       FROM ${tableName}
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json(
      { ok: true, data: maskRecordUuid(serializeRecord(requireRecord(rows[0]))) },
      { status: 201 }
    );
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
