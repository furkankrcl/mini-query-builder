import { IQueryBuilderFactory } from "./interfaces";
import { SelectQueryBuilder } from "./selectQuery";
import { InsertQueryBuilder } from "./insertQuery";
import { UpdateQueryBuilder } from "./updateQuery";
import { DeleteQueryBuilder } from "./deleteQuery";
import { EntityClass } from "../types";

/**
 * Factory for creating query builders (SOLID Factory Pattern)
 */
export class QueryBuilderFactory implements IQueryBuilderFactory {
  createSelect<T>(entityClass: EntityClass<T>) {
    return new SelectQueryBuilder(entityClass);
  }

  createInsert<T>(entityClass: EntityClass<T>) {
    return new InsertQueryBuilder(entityClass);
  }

  createUpdate<T>(entityClass: EntityClass<T>) {
    return new UpdateQueryBuilder(entityClass);
  }

  createDelete<T>(entityClass: EntityClass<T>) {
    return new DeleteQueryBuilder(entityClass);
  }
}

/**
 * Global query builder factory instance
 */
export const queryBuilderFactory = new QueryBuilderFactory();
