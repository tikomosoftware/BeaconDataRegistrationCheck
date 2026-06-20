import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

type SqlValue = string | number | null;

let pool: Pool | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

function getTidbPort() {
  const portValue = process.env.TIDB_PORT?.trim() ?? "4000";
  const port = Number(portValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("TIDB_PORT must be a valid TCP port number");
  }

  return port;
}

function getConnectionLimit() {
  const limitValue = process.env.TIDB_CONNECTION_LIMIT?.trim() ?? "5";
  const limit = Number(limitValue);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("TIDB_CONNECTION_LIMIT must be a positive integer");
  }

  return limit;
}

export function quoteIdentifier(identifier: string) {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error("SQL identifiers may only contain letters, numbers, and underscores");
  }

  return `\`${identifier}\``;
}

export function getBeaconTableName() {
  return quoteIdentifier(process.env.TIDB_IBEACON_TABLE?.trim() || "ibeacons");
}

export function getTidbPool() {
  if (pool) {
    return pool;
  }

  const database = getRequiredEnv("TIDB_DATABASE");

  if (database.toLowerCase() === "sys") {
    throw new Error("TIDB_DATABASE must be an application database, not sys");
  }

  pool = mysql.createPool({
    host: getRequiredEnv("TIDB_HOST"),
    port: getTidbPort(),
    user: getRequiredEnv("TIDB_USER"),
    password: getRequiredEnv("TIDB_PASSWORD"),
    database,
    waitForConnections: true,
    connectionLimit: getConnectionLimit(),
    enableKeepAlive: true,
    timezone: "Z",
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true
    }
  });

  return pool;
}

export async function queryTidbRows<T extends RowDataPacket[]>(
  sql: string,
  values: SqlValue[] = []
) {
  const [rows] = await getTidbPool().query<T>(sql, values);
  return rows;
}

export async function executeTidb(sql: string, values: SqlValue[] = []) {
  const [result] = await getTidbPool().execute<ResultSetHeader>(sql, values);
  return result;
}

export function toMysqlDateTime(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  const seconds = String(value.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(value.getUTCMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function toIsoString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString();
}
