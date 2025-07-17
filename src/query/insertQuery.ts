import { metadataStorage } from "../storage/MetadataStorage";

export function insertQuery(entity: any): { query: string; params: any[] } {
  const constructor = entity.constructor;
  const metadata = metadataStorage.getTable(constructor);

  const columns: string[] = [];
  const values: any[] = [];
  for (const column of metadata.columns) {
    if (column.excludeFromInsert) {
      continue;
    }

    columns.push(column.name);
    if (entity[column.propertyKey] === undefined) {
      values.push(null);
    } else if (column.transformer) {
      values.push(column.transformer.to(entity[column.propertyKey]));
    } else {
      values.push(entity[column.propertyKey]);
    }
  }

  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${metadata.name}(${columns.join(
    ", "
  )}) VALUES(${placeholders})`;

  return {
    query: sql,
    params: values,
  };
}
