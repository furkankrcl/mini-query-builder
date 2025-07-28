import { metadataStorage } from "../storage/MetadataStorage";
import { buildWhereClause, WhereClause } from "./whereClause";

function isFunctionFactory(
  input: Function | (() => Function)
): input is () => Function {
  return typeof input === "function" && input.length === 0;
}

export function selectQuery<T extends { new (...args: any[]): {} }>(
  entityClass: T,
  options?: {
    where?: WhereClause<InstanceType<T>>;
    relations?: string[];
    orderBy?: Partial<Record<keyof InstanceType<T>, "ASC" | "DESC">>;
  }
): { query: string; params: any[] } {
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

      const targetClass = isFunctionFactory(relation.targetClass)
        ? relation.targetClass()
        : relation.targetClass;

      const joinedMetadata = metadataStorage.getTable(targetClass);
      if (!joinedMetadata) continue;

      const joinedAlias = relation.targetTable;

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
  const { query: whereClause, params } = buildWhereClause<InstanceType<T>>(
    table,
    false,
    options?.where
  );

  // ORDER BY clause
  const orderByClauses: string[] = [];
  if (options?.orderBy) {
    for (const [key, direction] of Object.entries(options.orderBy)) {
      const columnMeta = table.columns.find((col) => col.propertyKey === key);
      if (columnMeta) {
        orderByClauses.push(`${alias}.${columnMeta.name} ${direction}`);
      }
    }
  }

  const queryParts: string[] = [];
  queryParts.push(`SELECT ${columns.join(", ")} FROM ${table.name} ${alias}`);
  if (joinClauses.length > 0) {
    queryParts.push(joinClauses.join(" "));
  }
  if (whereClause) {
    queryParts.push(whereClause);
  }
  if (orderByClauses.length > 0) {
    queryParts.push(`ORDER BY ${orderByClauses.join(", ")}`);
  }
  return { query: queryParts.join(" "), params };
}
