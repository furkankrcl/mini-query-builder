import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause } from "./whereClause";

export function updateQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  data: Partial<InstanceType<T>>,
  options?: {
    where?: Partial<InstanceType<T>>;
  }
): string {
  const table = metadataStorage.getTable(entityClass);

  if (!table) {
    throw new Error("Table metadata not found for the given entity.");
  }

  const updates: string[] = [];

  for (const column of table.columns) {
    if (!(column.propertyKey in data)) continue;
    const value = (data as any)[column.propertyKey];
    const formatted =
      value === undefined || value === null
        ? "NULL"
        : typeof value === "string"
        ? `'${value}'`
        : value;
    updates.push(`${column.name} = ${formatted}`);
  }

  const whereClause = buildWhereClause(table, true, options?.where);

  return `UPDATE ${table.name} SET ${updates.join(", ")} ${whereClause}`;
}
