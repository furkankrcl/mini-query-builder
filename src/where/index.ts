import { UnsupportedOperatorError } from "../types";

/**
 * WHERE clause operators for type-safe query building
 */
export interface IWhereOperators<T> {
  /** Equals */
  $eq?: T;
  /** Greater than */
  $gt?: T;
  /** Less than */
  $lt?: T;
  /** Greater than or equal */
  $gte?: T;
  /** Less than or equal */
  $lte?: T;
  /** Not equals */
  $not?: T;
  /** SQL LIKE pattern (only for string types) */
  $like?: T extends string ? string : never;
  /** IS NULL or IS NOT NULL */
  $null?: boolean;
  /** IN clause */
  $in?: T[];
}

/**
 * Type-safe WHERE clause definition
 */
export type WhereClause<T> = Partial<{
  [K in keyof T]: T[K] | IWhereOperators<T[K]>;
}>;

/**
 * Interface for WHERE clause builders
 */
export interface IWhereClauseBuilder {
  /**
   * Build WHERE clause from conditions
   * @param conditions - The WHERE conditions
   * @param tableName - Table name for aliasing
   * @param hideAlias - Whether to hide table alias
   * @returns Query fragment and parameters
   */
  build<T>(
    conditions: WhereClause<T> | undefined,
    tableName: string,
    hideAlias?: boolean
  ): { query: string; params: any[] };
}

/**
 * WHERE clause operator handlers
 */
export interface IOperatorHandler {
  /**
   * Build SQL for a specific operator
   * @param columnName - Column name with optional alias
   * @param operand - Operator value
   * @param transformer - Value transformer function
   * @returns SQL condition and parameters
   */
  handle(
    columnName: string,
    operand: any,
    transformer: (value: any) => any
  ): { condition: string; params: any[] };
}

/**
 * Registry for WHERE clause operators
 */
export class OperatorRegistry {
  private static operators = new Map<string, IOperatorHandler>();

  /**
   * Register an operator handler
   */
  static register(operator: string, handler: IOperatorHandler): void {
    this.operators.set(operator, handler);
  }

  /**
   * Get operator handler
   */
  static get(operator: string): IOperatorHandler {
    const handler = this.operators.get(operator);
    if (!handler) {
      throw new UnsupportedOperatorError(operator);
    }
    return handler;
  }

  /**
   * Check if operator is supported
   */
  static has(operator: string): boolean {
    return this.operators.has(operator);
  }
}

// Register default operators
OperatorRegistry.register("$eq", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} = ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$gt", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} > ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$lt", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} < ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$gte", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} >= ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$lte", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} <= ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$not", {
  handle: (columnName, operand, transformer) => ({
    condition: `${columnName} != ?`,
    params: [transformer(operand)],
  }),
});

OperatorRegistry.register("$like", {
  handle: (columnName, operand) => ({
    condition: `${columnName} LIKE ?`,
    params: [operand],
  }),
});

OperatorRegistry.register("$null", {
  handle: (columnName, operand) => ({
    condition: `${columnName} IS ${operand ? "" : "NOT "}NULL`,
    params: [],
  }),
});

OperatorRegistry.register("$in", {
  handle: (columnName, operand, transformer) => {
    const values = operand as any[];
    const placeholders = values.map(() => "?").join(", ");
    return {
      condition: `${columnName} IN (${placeholders})`,
      params: values.map(transformer),
    };
  },
});
