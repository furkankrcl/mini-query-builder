import { metadataStorage } from "../storage/MetadataStorage";

export function insertQuery(entity: any): string {
  const constructor = entity.constructor;
  const metadata = metadataStorage.getTable(constructor);

  const columns = metadata.columns.map((col) => col.name);
  const values = metadata.columns.map((col) => {
    const value = entity[col.propertyKey];
    if (value === undefined || value === null) return "NULL";
    return typeof value === "string" ? `'${value}'` : value;
  });

  const sql = `INSERT INTO ${metadata.name}(${columns.join(
    ", "
  )}) VALUES(${values.join(", ")})`;
  return sql;
}
