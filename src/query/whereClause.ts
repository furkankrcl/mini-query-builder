import { TableMetadata } from "../storage/MetadataStorage";

function formatValue(val: any): string {
  if (val === null) return "NULL";
  if (typeof val === "string") return `'${val}'`;
  return `${val}`;
}

export function buildWhereClause<T>(
  table: TableMetadata,
  hideAlias = false,
  where?: Partial<Record<keyof T, any>>
): string {
  if (!where) return "";
  const alias = hideAlias ? "" : `${table.name}.`;
  const conditions = Object.entries(where).map(([propertyKey, value]) => {
    const columnMeta = table.columns.find(
      (col) => col.propertyKey === propertyKey
    );
    const columnName = columnMeta?.name || propertyKey;
    if (typeof value !== "object" || value === null) {
      return `${alias}${columnName} = ${formatValue(value)}`;
    }

    const operator = Object.keys(value)[0];
    const operand = (value as any)[operator];

    switch (operator) {
      case "$eq":
        return `${alias}${columnName} = ${formatValue(operand)}`;
      case "$gt":
        return `${alias}${columnName} > ${formatValue(operand)}`;
      case "$lt":
        return `${alias}${columnName} < ${formatValue(operand)}`;
      case "$like":
        return `${alias}${columnName} LIKE ${formatValue(operand)}`;
      case "$in":
        return `${alias}${columnName} IN (${(operand as any[])
          .map(formatValue)
          .join(", ")})`;
      case "$null":
        return `${alias}${columnName} IS ${operand ? "" : "NOT "}NULL`;
      case "$gte":
        return `${alias}${columnName} >= ${formatValue(operand)}`;
      case "$lte":
        return `${alias}${columnName} <= ${formatValue(operand)}`;
      case "$not":
        return `${alias}${columnName} != ${formatValue(operand)}`;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  });
  return `WHERE ${conditions.join(" AND ")}`;
}
