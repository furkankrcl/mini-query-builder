import { metadataStorage } from "../storage/MetadataStorage";
import { WhereClauseBuilder, WhereClause } from "./whereClause";
import { IDeleteQueryBuilder, IDeleteOptions } from "./interfaces";
import { IQueryResult, EntityClass } from "../types";

/**
 * Enhanced DELETE query builder with SOLID principles
 */
export class DeleteQueryBuilder<T> implements IDeleteQueryBuilder<T> {
  private entityClass: EntityClass<T>;
  private whereConditions?: WhereClause<T>;

  private readonly whereBuilder = new WhereClauseBuilder();

  constructor(entityClass: EntityClass<T>) {
    this.entityClass = entityClass;
  }

  where(conditions: WhereClause<T>): this {
    this.whereConditions = conditions;
    return this;
  }

  build(): IQueryResult {
    const table = metadataStorage.getTable(this.entityClass);

    // Build WHERE clause
    const whereClause = this.whereBuilder.buildWithMetadata(
      table,
      true,
      this.whereConditions
    );

    const queryParts: string[] = [];
    queryParts.push(`DELETE FROM ${table.name}`);

    if (whereClause.query) {
      queryParts.push(whereClause.query);
    }

    return {
      query: queryParts.join(" "),
      params: whereClause.params,
    };
  }
}

/**
 * Factory function for creating DELETE queries (backwards compatibility)
 */
export function deleteQuery<T extends EntityClass>(
  entityClass: T,
  options?: IDeleteOptions<InstanceType<T>>
): IQueryResult {
  const builder = new DeleteQueryBuilder(entityClass);

  if (options?.where) {
    builder.where(options.where);
  }

  return builder.build();
}
