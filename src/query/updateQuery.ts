import { metadataStorage } from "../storage/MetadataStorage";

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

  let whereClause = "";

  if (options?.where) {
    const whereParts = Object.entries(options.where).map(([key, value]) => {
      const columnMeta = table.columns.find((col) => col.propertyKey === key);
      if (!columnMeta) throw new Error(`Column '${key}' not found`);
      const val = typeof value === "number" ? value : `'${value}'`;
      return `${columnMeta.name} = ${val}`;
    });

    whereClause = ` WHERE ${whereParts.join(" AND ")}`;
  }

  return `UPDATE ${table.name} SET ${updates.join(", ")}${whereClause}`;
}
