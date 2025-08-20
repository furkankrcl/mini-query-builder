import { metadataStorage } from "../storage/MetadataStorage";
import { WhereClauseBuilder, WhereClause } from "./whereClause";
import {
  ISelectQueryBuilder,
  ISelectOptions,
  IJoinBuilder,
  IColumnSelector,
} from "./interfaces";
import {
  IQueryResult,
  EntityClass,
  SortDirection,
  MetadataNotFoundError,
  InvalidRelationError,
  RelationKeys,
  IRelationConfig,
} from "../types";

/**
 * Utility to check if input is a function factory
 */
export function isFunctionFactory(
  input: EntityClass | (() => EntityClass)
): input is () => EntityClass {
  return typeof input === "function" && input.length === 0;
}

/**
 * JOIN builder for handling table relations
 */
class JoinBuilder implements IJoinBuilder {
  buildJoins(
    tableName: string,
    relations: string[],
    tableMetadata: any
  ): { joinClauses: string[]; joinColumns: string[] } {
    const joinColumns: string[] = [];
    const joinClauses: string[] = [];

    for (const relationKey of relations) {
      const relation = tableMetadata.relations.find(
        (r: any) => r.propertyKey === relationKey
      );

      if (!relation) {
        throw new InvalidRelationError(`Relation '${relationKey}' not found`);
      }

      const targetClass = isFunctionFactory(relation.targetClass)
        ? relation.targetClass()
        : relation.targetClass;

      const joinedMetadata = metadataStorage.getTable(targetClass);
      const joinedAlias = relation.targetTable;

      // Add joined table columns with alias
      joinColumns.push(
        ...joinedMetadata.columns.map(
          (col: any) =>
            `${joinedAlias}.${col.name} AS ${relation.propertyKey}_${col.name}`
        )
      );

      // Create LEFT JOIN clause
      joinClauses.push(
        `LEFT JOIN ${relation.targetTable} ON ${tableName}.${relation.selfReference} = ${relation.targetTable}.${relation.targetColumn}`
      );
    }

    return { joinClauses, joinColumns };
  }
}

/**
 * Column selector for building SELECT column lists
 */
class ColumnSelector implements IColumnSelector {
  selectColumns(tableName: string, columns: any[], alias?: string): string[] {
    const tableAlias = alias || tableName;
    return columns.map(
      (col) => `${tableAlias}.${col.name} AS ${tableAlias}_${col.name}`
    );
  }
}

/**
 * Enhanced SELECT query builder with SOLID principles
 */
export class SelectQueryBuilder<T> implements ISelectQueryBuilder<T> {
  private entityClass: EntityClass<T>;
  private whereConditions?: WhereClause<T>;
  private relationsList: string[] = [];
  private orderByClause: Partial<Record<keyof T, SortDirection>> = {};
  private limitCount?: number;
  private offsetCount?: number;

  private readonly whereBuilder = new WhereClauseBuilder();
  private readonly joinBuilder = new JoinBuilder();
  private readonly columnSelector = new ColumnSelector();

  constructor(entityClass: EntityClass<T>) {
    this.entityClass = entityClass;
  }

  where(conditions: WhereClause<T>): this {
    this.whereConditions = conditions;
    return this;
  }

  relations(relations: string[]): this {
    this.relationsList = relations;
    return this;
  }

  relation(relationName: RelationKeys<T>, config?: IRelationConfig): this {
    // Convert single relation to RelationSpec format and add to relations list
    if (!this.relationsList) {
      this.relationsList = [];
    }

    // For now, just add the relation name to the list
    // TODO: Store the config for advanced JOIN handling
    if (!this.relationsList.includes(relationName as string)) {
      this.relationsList.push(relationName as string);
    }

    return this;
  }

  orderBy(column: keyof T, direction: SortDirection): this {
    this.orderByClause[column] = direction;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  offset(count: number): this {
    this.offsetCount = count;
    return this;
  }

  build(): IQueryResult {
    const table = metadataStorage.getTable(this.entityClass);
    const alias = table.name;

    // Base columns
    const baseColumns = this.columnSelector.selectColumns(
      alias,
      table.columns,
      alias
    );

    // Handle relations
    const { joinClauses, joinColumns } = this.joinBuilder.buildJoins(
      alias,
      this.relationsList,
      table
    );

    const columns = [...baseColumns, ...joinColumns];

    // WHERE clause
    const { query: whereClause, params } = this.whereBuilder.buildWithMetadata(
      table,
      false,
      this.whereConditions
    );

    // ORDER BY clause
    const orderByClauses = this.buildOrderByClause(table, alias);

    // Build final query
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

    if (this.limitCount !== undefined) {
      queryParts.push(`LIMIT ${this.limitCount}`);
    }

    if (this.offsetCount !== undefined) {
      queryParts.push(`OFFSET ${this.offsetCount}`);
    }

    return { query: queryParts.join(" "), params: params };
  }

  private buildOrderByClause(table: any, alias: string): string[] {
    const orderByClauses: string[] = [];

    for (const [key, direction] of Object.entries(this.orderByClause)) {
      const columnMeta = table.columns.find(
        (col: any) => col.propertyKey === key
      );
      if (columnMeta) {
        orderByClauses.push(`${alias}.${columnMeta.name} ${direction}`);
      }
    }

    return orderByClauses;
  }
}

/**
 * Factory function for creating SELECT queries (backwards compatibility)
 */
export function selectQuery<T extends EntityClass>(
  entityClass: T,
  options?: ISelectOptions<InstanceType<T>>
): IQueryResult {
  const builder = new SelectQueryBuilder(entityClass);

  if (options?.where) {
    builder.where(options.where);
  }

  if (options?.relations) {
    // Handle both string[] and RelationSpec[] for backward compatibility
    const relationNames = options.relations.map((rel) => {
      if (typeof rel === "string") {
        return rel;
      } else {
        return rel.relationName as string;
      }
    });
    builder.relations(relationNames);
  }

  if (options?.orderBy) {
    for (const [column, direction] of Object.entries(options.orderBy)) {
      if (direction) {
        builder.orderBy(column as keyof InstanceType<T>, direction);
      }
    }
  }

  if (options?.limit !== undefined) {
    builder.limit(options.limit);
  }

  if (options?.offset !== undefined) {
    builder.offset(options.offset);
  }

  return builder.build();
}
