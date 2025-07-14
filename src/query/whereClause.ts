import { TableMetadata } from "../storage/MetadataStorage";

export function buildWhereClause<T>(
  table: TableMetadata,
  hideAlias = false,
  where?: Partial<Record<keyof T, any>>
): { query: string; params: any[] } {
  if (!where) return { query: "", params: [] };

  const alias = hideAlias ? "" : `${table.name}.`;
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [propertyKey, value] of Object.entries(where)) {
    const columnMeta = table.columns.find(
      (col) => col.propertyKey === propertyKey
    );
    const columnName = columnMeta?.name || propertyKey;

    if (typeof value !== "object" || value === null) {
      conditions.push(`${alias}${columnName} = ?`);
      params.push(value ?? null);
      continue;
    }

    const operator = Object.keys(value)[0];
    const operand = (value as any)[operator];

    switch (operator) {
      case "$eq":
        conditions.push(`${alias}${columnName} = ?`);
        params.push(operand);
        break;
      case "$gt":
        conditions.push(`${alias}${columnName} > ?`);
        params.push(operand);
        break;
      case "$lt":
        conditions.push(`${alias}${columnName} < ?`);
        params.push(operand);
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
        params.push(...operand);
        break;
      case "$null":
        conditions.push(
          `${alias}${columnName} IS ${operand ? "" : "NOT "}NULL`
        );
        break;
      case "$gte":
        conditions.push(`${alias}${columnName} >= ?`);
        params.push(operand);
        break;
      case "$lte":
        conditions.push(`${alias}${columnName} <= ?`);
        params.push(operand);
        break;
      case "$not":
        conditions.push(`${alias}${columnName} != ?`);
        params.push(operand);
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  return {
    query: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}
