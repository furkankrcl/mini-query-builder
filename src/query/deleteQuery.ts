import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause } from "./whereClause";

export function deleteQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  options?: {
    where?: Partial<InstanceType<T>>;
  }
): { query: string; params: any[] } {
  const table = metadataStorage.getTable(entityClass);

  if (!table) {
    throw new Error("Table metadata not found for the given entity.");
  }
  const whereClause = buildWhereClause(table, true, options?.where);

  return {
    query: `DELETE FROM ${table.name}${whereClause.query}`,
    params: whereClause.params,
  };
}
