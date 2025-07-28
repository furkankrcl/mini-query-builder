import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause, WhereClause } from "./whereClause";

export function updateQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  data: Partial<InstanceType<T>>,
  options?: {
    where?: WhereClause<InstanceType<T>>;
  }
): { query: string; params: any[] } {
  const table = metadataStorage.getTable(entityClass);

  if (!table) {
    throw new Error("Table metadata not found for the given entity.");
  }

  const updates: { clause: string; value: any[] }[] = [];

  for (const column of table.columns) {
    if (!(column.propertyKey in data)) continue;
    if (column.excludeFromUpdate) continue;
    let value = (data as any)[column.propertyKey];
    value = column.transformer ? column.transformer.to(value) : value;
    updates.push({
      clause: `${column.name} = ?`,
      value: [value ?? null],
    });
  }

  const whereClause = buildWhereClause(table, true, options?.where);

  const queryParts: string[] = [];
  const params: any[] = [];
  queryParts.push(`UPDATE ${table.name} SET`);
  queryParts.push(updates.map((u) => u.clause).join(", "));
  params.push(...updates.flatMap((u) => u.value));

  if (whereClause.query) {
    queryParts.push(whereClause.query);
    params.push(...whereClause.params);
  }

  return {
    query: queryParts.join(" "),
    params: params,
  };
}
