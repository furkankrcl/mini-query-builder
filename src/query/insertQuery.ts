import { metadataStorage } from "../storage/MetadataStorage";
import { IInsertQueryBuilder } from "./interfaces";
import { IQueryResult, EntityClass } from "../types";

/**
 * Enhanced INSERT query builder with SOLID principles
 */
export class InsertQueryBuilder<T> implements IInsertQueryBuilder<T> {
  private entityClass: EntityClass<T>;
  private entity?: T;
  private entities?: T[];

  constructor(entityClass: EntityClass<T>) {
    this.entityClass = entityClass;
  }

  values(entity: T): this {
    this.entity = entity;
    this.entities = undefined;
    return this;
  }

  valuesArray(entities: T[]): this {
    this.entities = entities;
    this.entity = undefined;
    return this;
  }

  build(): IQueryResult {
    if (this.entity) {
      return this.buildSingleInsert(this.entity);
    } else if (this.entities && this.entities.length > 0) {
      return this.buildBatchInsert(this.entities);
    } else {
      throw new Error("No values provided for INSERT query");
    }
  }

  private buildSingleInsert(entity: T): IQueryResult {
    const constructor = (entity as any).constructor;
    const metadata = metadataStorage.getTable(constructor);

    const columns: string[] = [];
    const values: any[] = [];

    for (const column of metadata.columns) {
      if (column.excludeFromInsert) {
        continue;
      }

      columns.push(column.name);
      const entityValue = (entity as any)[column.propertyKey];

      if (entityValue === undefined) {
        values.push(null);
      } else if (column.transformer) {
        values.push(column.transformer.to(entityValue));
      } else {
        values.push(entityValue);
      }
    }

    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${metadata.name}(${columns.join(
      ", "
    )}) VALUES(${placeholders})`;

    return {
      query: sql,
      params: values,
    };
  }

  private buildBatchInsert(entities: T[]): IQueryResult {
    if (entities.length === 0) {
      throw new Error("Empty array provided for batch insert");
    }

    const constructor = (entities[0] as any).constructor;
    const metadata = metadataStorage.getTable(constructor);

    const columns: string[] = [];
    const insertColumns = metadata.columns.filter(
      (col) => !col.excludeFromInsert
    );

    for (const column of insertColumns) {
      columns.push(column.name);
    }

    const allValues: any[] = [];
    const valuePlaceholders: string[] = [];

    for (const entity of entities) {
      const rowValues: any[] = [];

      for (const column of insertColumns) {
        const entityValue = (entity as any)[column.propertyKey];

        if (entityValue === undefined) {
          rowValues.push(null);
        } else if (column.transformer) {
          rowValues.push(column.transformer.to(entityValue));
        } else {
          rowValues.push(entityValue);
        }
      }

      allValues.push(...rowValues);
      valuePlaceholders.push(`(${columns.map(() => "?").join(", ")})`);
    }

    const sql = `INSERT INTO ${metadata.name}(${columns.join(
      ", "
    )}) VALUES ${valuePlaceholders.join(", ")}`;

    return {
      query: sql,
      params: allValues,
    };
  }
}

/**
 * Factory function for creating INSERT queries (backwards compatibility)
 */
export function insertQuery(entity: any): IQueryResult {
  const constructor = entity.constructor;
  const builder = new InsertQueryBuilder(constructor);
  return builder.values(entity).build();
}
