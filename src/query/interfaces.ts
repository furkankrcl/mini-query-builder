import {
  IQueryResult,
  EntityClass,
  SortDirection,
  RelationSpec,
  RelationKeys,
  IRelationConfig,
} from "../types";
import { WhereClause } from "../where";

/**
 * Base interface for all query builders
 */
export interface IQueryBuilder<T = any> {
  /**
   * Build the SQL query
   */
  build(): IQueryResult;
}

/**
 * Interface for SELECT query options
 */
export interface ISelectOptions<T> {
  /** WHERE conditions */
  where?: WhereClause<T>;
  /** Relations to include */
  relations?: string[] | RelationSpec<T>[];
  /** ORDER BY clauses */
  orderBy?: Partial<Record<keyof T, SortDirection>>;
  /** LIMIT clause */
  limit?: number;
  /** OFFSET clause */
  offset?: number;
}

/**
 * Interface for UPDATE query options
 */
export interface IUpdateOptions<T> {
  /** WHERE conditions */
  where?: WhereClause<T>;
}

/**
 * Interface for DELETE query options
 */
export interface IDeleteOptions<T> {
  /** WHERE conditions */
  where?: WhereClause<T>;
}

/**
 * Interface for SELECT query builders
 */
export interface ISelectQueryBuilder<T> extends IQueryBuilder<T> {
  /**
   * Add WHERE conditions
   */
  where(conditions: WhereClause<T>): this;

  /**
   * Add relations to include (legacy method)
   */
  relations(relations: string[]): this;

  /**
   * Add a single relation to include with optional configuration
   */
  relation(relationName: RelationKeys<T>, config?: IRelationConfig): this;

  /**
   * Add ORDER BY clause
   */
  orderBy(column: keyof T, direction: SortDirection): this;

  /**
   * Add LIMIT clause
   */
  limit(count: number): this;

  /**
   * Add OFFSET clause
   */
  offset(count: number): this;
}

/**
 * Interface for INSERT query builders
 */
export interface IInsertQueryBuilder<T> extends IQueryBuilder<T> {
  /**
   * Set values to insert
   */
  values(entity: T): this;

  /**
   * Insert multiple entities
   */
  valuesArray(entities: T[]): this;
}

/**
 * Interface for UPDATE query builders
 */
export interface IUpdateQueryBuilder<T> extends IQueryBuilder<T> {
  /**
   * Set values to update
   */
  set(values: Partial<T>): this;

  /**
   * Add WHERE conditions
   */
  where(conditions: WhereClause<T>): this;
}

/**
 * Interface for DELETE query builders
 */
export interface IDeleteQueryBuilder<T> extends IQueryBuilder<T> {
  /**
   * Add WHERE conditions
   */
  where(conditions: WhereClause<T>): this;
}

/**
 * Factory interface for creating query builders
 */
export interface IQueryBuilderFactory {
  /**
   * Create SELECT query builder
   */
  createSelect<T>(entityClass: EntityClass<T>): ISelectQueryBuilder<T>;

  /**
   * Create INSERT query builder
   */
  createInsert<T>(entityClass: EntityClass<T>): IInsertQueryBuilder<T>;

  /**
   * Create UPDATE query builder
   */
  createUpdate<T>(entityClass: EntityClass<T>): IUpdateQueryBuilder<T>;

  /**
   * Create DELETE query builder
   */
  createDelete<T>(entityClass: EntityClass<T>): IDeleteQueryBuilder<T>;
}

/**
 * Interface for JOIN clause builders
 */
export interface IJoinBuilder {
  /**
   * Build JOIN clauses for relations
   */
  buildJoins(
    tableName: string,
    relations: string[],
    tableMetadata: any
  ): {
    joinClauses: string[];
    joinColumns: string[];
  };
}

/**
 * Interface for column selectors
 */
export interface IColumnSelector {
  /**
   * Select columns for a table
   */
  selectColumns(tableName: string, columns: any[], alias?: string): string[];
}
