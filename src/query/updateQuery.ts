import { metadataStorage } from "../storage/MetadataStorage";
import { WhereClauseBuilder, WhereClause } from "./whereClause";
import { IUpdateQueryBuilder, IUpdateOptions } from "./interfaces";
import { IQueryResult, EntityClass } from "../types";

/**
 * Enhanced UPDATE query builder with SOLID principles
 */
export class UpdateQueryBuilder<T> implements IUpdateQueryBuilder<T> {
  private entityClass: EntityClass<T>;
  private updateValues?: Partial<T>;
  private whereConditions?: WhereClause<T>;

  private readonly whereBuilder = new WhereClauseBuilder();

  constructor(entityClass: EntityClass<T>) {
    this.entityClass = entityClass;
  }

  set(values: Partial<T>): this {
    this.updateValues = values;
    return this;
  }

  where(conditions: WhereClause<T>): this {
    this.whereConditions = conditions;
    return this;
  }

  build(): IQueryResult {
    if (!this.updateValues || Object.keys(this.updateValues).length === 0) {
      throw new Error("No values provided for UPDATE query");
    }

    const table = metadataStorage.getTable(this.entityClass);
    const updates: { clause: string; value: any[] }[] = [];

    // Build SET clause
    for (const column of table.columns) {
      if (!(column.propertyKey in this.updateValues)) continue;
      if (column.excludeFromUpdate) continue;

      let value = (this.updateValues as any)[column.propertyKey];
      value = column.transformer ? column.transformer.to(value) : value;

      updates.push({
        clause: `${column.name} = ?`,
        value: [value ?? null],
      });
    }

    if (updates.length === 0) {
      throw new Error("No updatable columns found");
    }

    // Build WHERE clause
    const whereClause = this.whereBuilder.buildWithMetadata(
      table,
      true,
      this.whereConditions
    );

    const queryParts: string[] = [];
    const params: any[] = [];

    queryParts.push(`UPDATE ${table.name} SET`);
    queryParts.push(updates.map((u) => u.clause).join(", "));
    params.push(...updates.flatMap((u) => u.value));

    if (whereClause.query) {
      queryParts.push(whereClause.query);
      params.push(...whereClause.params);
    }

    return {
      query: queryParts.join(" "),
      params: params,
    };
  }
}

/**
 * Factory function for creating UPDATE queries (backwards compatibility)
 */
export function updateQuery<T extends EntityClass>(
  entityClass: T,
  data: Partial<InstanceType<T>>,
  options?: IUpdateOptions<InstanceType<T>>
): IQueryResult {
  const builder = new UpdateQueryBuilder(entityClass);

  builder.set(data);

  if (options?.where) {
    builder.where(options.where);
  }

  return builder.build();
}
