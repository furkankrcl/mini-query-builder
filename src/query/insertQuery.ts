import { metadataStorage } from "../storage/MetadataStorage";

export function insertQuery(entity: any): { query: string; params: any[] } {
  const constructor = entity.constructor;
  const metadata = metadataStorage.getTable(constructor);

  const columns = metadata.columns.map((col) => col.name);
  const values = metadata.columns.map((col) => {
    if (entity[col.propertyKey] === undefined) {
      return null;
    } else if (col.transformer) {
      return col.transformer.to(entity[col.propertyKey]);
    }
    return entity[col.propertyKey];
  });

  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${metadata.name}(${columns.join(
    ", "
  )}) VALUES(${placeholders})`;

  return {
    query: sql,
    params: values,
  };
}
