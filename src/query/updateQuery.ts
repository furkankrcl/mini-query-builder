import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause } from "./whereClause";

export function updateQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  data: Partial<InstanceType<T>>,
  options?: {
    where?: Partial<InstanceType<T>>;
  }
): { query: string; params: any[] } {
  const table = metadataStorage.getTable(entityClass);

  if (!table) {
    throw new Error("Table metadata not found for the given entity.");
  }

  const updates: { clause: string; value: any[] }[] = [];

  for (const column of table.columns) {
    if (!(column.propertyKey in data)) continue;
    let value = (data as any)[column.propertyKey];
    value = column.transformer ? column.transformer.to(value) : value;
    updates.push({
      clause: `${column.name} = ?`,
      value: [value ?? null],
    });
  }

  const whereClause = buildWhereClause(table, true, options?.where);

  return {
    query: `UPDATE ${table.name} SET ${updates
      .map((u) => u.clause)
      .join(", ")}${whereClause.query}`,
    params: [...updates.flatMap((u) => u.value), ...whereClause.params],
  };
}
