import { metadataStorage } from "../storage/MetadataStorage";

export function selectQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  options?: {
    where?: Partial<{
      [K in keyof InstanceType<T>]: InstanceType<T>[K];
    }>;
    relations?: string[];
  }
): string {
  const table = metadataStorage.getTable(entityClass);
  const alias = table.name; // alias olarak da tablo adını kullanıyoruz

  // Ana tablonun kolonları
  const baseColumns = table.columns.map(
    (col) => `${alias}.${col.name} AS ${alias}_${col.name}`
  );

  const joinColumns: string[] = [];
  const joinClauses: string[] = [];

  // İlişkiler varsa JOIN'leri hazırla
  if (options?.relations) {
    for (const relationKey of options.relations) {
      const relation = table.relations.find(
        (r) => r.propertyKey === relationKey
      );
      if (!relation) continue;

      const joinedAlias = relation.targetTable;

      // joined tablonun kolonlarını çekmek için metadata bulmaya çalış
      const joinedMetadata = [...metadataStorage["tables"].values()].find(
        (m) => m.name === relation.targetTable
      );
      if (!joinedMetadata) continue;

      // joined tablonun kolonlarını alias ile yaz
      joinColumns.push(
        ...joinedMetadata.columns.map(
          (col) =>
            `${joinedAlias}.${col.name} AS ${relation.propertyKey}_${col.name}`
        )
      );

      // LEFT JOIN satırı oluştur
      joinClauses.push(
        `LEFT JOIN ${relation.targetTable} ON ${alias}.${relation.selfReference} = ${relation.targetTable}.${relation.targetColumn}`
      );
    }
  }

  const columns = [...baseColumns, ...joinColumns];

  // WHERE clause
  let whereClause = "";
  if (options?.where) {
    const conditions = Object.entries(options.where).map(([key, value]) => {
      if (typeof value === "string") {
        return `${alias}.${key} = '${value}'`;
      }
      return `${alias}.${key} = ${value}`;
    });
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  const query = `SELECT ${columns.join(", ")} FROM ${
    table.name
  } ${alias} ${joinClauses.join(" ")} ${whereClause}`;
  return query.trim();
}
