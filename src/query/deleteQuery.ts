import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause, WhereClause } from "./whereClause";

export function deleteQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  options?: {
    where?: WhereClause<InstanceType<T>>;
  }
): { query: string; params: any[] } {
  const table = metadataStorage.getTable(entityClass);

  if (!table) {
    throw new Error("Table metadata not found for the given entity.");
  }
  const whereClause = buildWhereClause(table, true, options?.where);

  const queryParts: string[] = [];
  queryParts.push(`DELETE FROM ${table.name}`);

  if (whereClause.query) {
    queryParts.push(whereClause.query);
  }

  return {
    query: queryParts.join(" "),
    params: whereClause.params,
  };
}
