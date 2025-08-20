import { ITableMetadata, IColumnMetadata } from "../types";
import { WhereClause, IWhereClauseBuilder, OperatorRegistry } from "../where";

/**
 * Enhanced WHERE clause builder with SOLID principles
 */
export class WhereClauseBuilder implements IWhereClauseBuilder {
  /**
   * Build WHERE clause from conditions
   */
  build<T>(
    conditions: WhereClause<T> | undefined,
    tableName: string,
    hideAlias = false
  ): { query: string; params: any[] } {
    if (!conditions) {
      return { query: "", params: [] };
    }

    const alias = hideAlias ? "" : `${tableName}.`;
    const conditionParts: string[] = [];
    const params: any[] = [];

    for (const [propertyKey, value] of Object.entries(conditions)) {
      const result = this.buildCondition(
        propertyKey,
        value,
        alias,
        (val: any) => val // Default transformer, will be overridden with metadata
      );

      conditionParts.push(result.condition);
      params.push(...result.params);
    }

    return {
      query:
        conditionParts.length > 0
          ? `WHERE ${conditionParts.join(" AND ")}`
          : "",
      params,
    };
  }

  /**
   * Build WHERE clause with metadata support
   */
  buildWithMetadata<T>(
    table: ITableMetadata,
    hideAlias = false,
    conditions?: WhereClause<T>
  ): { query: string; params: any[] } {
    if (!conditions) {
      return { query: "", params: [] };
    }

    const alias = hideAlias ? "" : `${table.name}.`;
    const conditionParts: string[] = [];
    const params: any[] = [];

    for (const [propertyKey, value] of Object.entries(conditions)) {
      const columnMeta = table.columns.find(
        (col) => col.propertyKey === propertyKey
      );

      const transformer = this.createTransformer(columnMeta);
      const columnName = columnMeta?.name || propertyKey;

      const result = this.buildCondition(columnName, value, alias, transformer);

      conditionParts.push(result.condition);
      params.push(...result.params);
    }

    return {
      query:
        conditionParts.length > 0
          ? `WHERE ${conditionParts.join(" AND ")}`
          : "",
      params,
    };
  }

  /**
   * Build a single condition
   */
  private buildCondition(
    columnName: string,
    value: any,
    alias: string,
    transformer: (val: any) => any
  ): { condition: string; params: any[] } {
    const fullColumnName = `${alias}${columnName}`;

    // Handle simple equality
    if (typeof value !== "object" || value === null) {
      return {
        condition: `${fullColumnName} = ?`,
        params: [transformer(value ?? null)],
      };
    }

    // Handle operators
    const operator = Object.keys(value)[0];
    const operand = value[operator];

    if (!OperatorRegistry.has(operator)) {
      // Fallback for non-operator objects
      return {
        condition: `${fullColumnName} = ?`,
        params: [transformer(value)],
      };
    }

    const handler = OperatorRegistry.get(operator);
    return handler.handle(fullColumnName, operand, transformer);
  }

  /**
   * Create transformer function from column metadata
   */
  private createTransformer(columnMeta?: IColumnMetadata): (val: any) => any {
    return (val: any) => {
      if (val === undefined || val === null) {
        return null;
      }
      if (!columnMeta?.transformer) {
        return val;
      }
      return columnMeta.transformer.to(val);
    };
  }
}

/**
 * Build WHERE clause using table metadata
 * @deprecated Use WhereClauseBuilder class instead
 */
export function buildWhereClause<T>(
  table: ITableMetadata,
  hideAlias = false,
  where?: WhereClause<T>
): { query: string; params: any[] } {
  const builder = new WhereClauseBuilder();
  return builder.buildWithMetadata(table, hideAlias, where);
}

// Re-export types for backwards compatibility
export type { WhereClause };
