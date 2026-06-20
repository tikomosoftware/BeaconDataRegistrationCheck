export function createLegacyDatabaseClient(): never {
  throw new Error("Legacy database access has been replaced by TiDB. Use src/lib/tidb.ts instead.");
}
