import { TableMetadata } from "../storage/MetadataStorage";

type WhereOperator<T> = {
  $eq?: T;
  $gt?: T;
  $lt?: T;
  $gte?: T;
  $lte?: T;
  $not?: T;
  $like?: string;
  $null?: boolean;
  $in?: T[];
};

export type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | WhereOperator<T[K]>;
}>;

export function buildWhereClause<T>(
  table: TableMetadata,
  hideAlias = false,
  where?: WhereClause<T>
): { query: string; params: any[] } {
  if (!where) return { query: "", params: [] };

  const alias = hideAlias ? "" : `${table.name}.`;
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [propertyKey, value] of Object.entries(where)) {
    const columnMeta = table.columns.find(
      (col) => col.propertyKey === propertyKey
    );
    const transformer = (val: any) => {
      if (val === undefined || val === null) {
        return null;
      }
      if (!columnMeta?.transformer) {
        return val;
      }
      return columnMeta.transformer.to(val);
    };
    const columnName = columnMeta?.name || propertyKey;

    if (typeof value !== "object" || value === null) {
      conditions.push(`${alias}${columnName} = ?`);
      params.push(transformer(value ?? null));
      continue;
    }

    const operator = Object.keys(value)[0];
    const operand = (value as any)[operator];

    switch (operator) {
      case "$eq":
        conditions.push(`${alias}${columnName} = ?`);
        params.push(transformer(operand));
        break;
      case "$gt":
        conditions.push(`${alias}${columnName} > ?`);
        params.push(transformer(operand));
        break;
      case "$lt":
        conditions.push(`${alias}${columnName} < ?`);
        params.push(transformer(operand));
        break;
      case "$like":
        conditions.push(`${alias}${columnName} LIKE ?`);
        params.push(operand);
        break;
      case "$in":
        conditions.push(
          `${alias}${columnName} IN (${(operand as any[])
            .map(() => "?")
            .join(", ")})`
        );
        params.push(...operand.map(transformer));
        break;
      case "$null":
        conditions.push(
          `${alias}${columnName} IS ${operand ? "" : "NOT "}NULL`
        );
        break;
      case "$gte":
        conditions.push(`${alias}${columnName} >= ?`);
        params.push(transformer(operand));
        break;
      case "$lte":
        conditions.push(`${alias}${columnName} <= ?`);
        params.push(transformer(operand));
        break;
      case "$not":
        conditions.push(`${alias}${columnName} != ?`);
        params.push(transformer(operand));
        break;
      default:
        if (columnMeta?.transformer) {
          conditions.push(`${alias}${columnName} = ?`);
          params.push(transformer(value));
          break;
        }
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  return {
    query: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}
