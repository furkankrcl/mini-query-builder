import { metadataStorage } from "../storage/MetadataStorage";
import { EntityClass, IColumnMetadata } from "../types";

/**
 * Interface for entity mapping
 */
export interface IEntityMapper {
  /**
   * Map database row to entity instance
   */
  mapRowToEntity<T>(
    entityClass: EntityClass<T>,
    row: Record<string, any>,
    columnPrefix?: string
  ): T;
}

/**
 * Default entity mapper implementation
 */
export class DefaultEntityMapper implements IEntityMapper {
  mapRowToEntity<T>(
    entityClass: EntityClass<T>,
    row: Record<string, any>,
    columnPrefix?: string
  ): T {
    const instance = new entityClass();
    const table = metadataStorage.getTable(entityClass);
    const colPrefix = columnPrefix || `${table.name}_`;

    for (const column of table.columns) {
      const key = `${colPrefix}${column.name}`;
      if (key in row) {
        this.setColumnValue(instance, column, row[key]);
      }
    }

    // Note: Relation mapping is commented out in original code
    // TODO: Implement relation mapping in future versions

    return instance;
  }

  private setColumnValue<T>(
    instance: T,
    column: IColumnMetadata,
    value: any
  ): void {
    const transformedValue = column.transformer
      ? column.transformer.from(value)
      : value;

    (instance as any)[column.propertyKey] = transformedValue;
  }
}

/**
 * Base entity class with enhanced ORM capabilities
 */
export abstract class BaseEntity {
  private static mapper: IEntityMapper = new DefaultEntityMapper();

  /**
   * Set custom entity mapper
   */
  public static setMapper(mapper: IEntityMapper): void {
    BaseEntity.mapper = mapper;
  }

  /**
   * Get current entity mapper
   */
  public static getMapper(): IEntityMapper {
    return BaseEntity.mapper;
  }

  /**
   * Convert database row to model instance
   */
  public static toModel<T extends BaseEntity>(
    this: EntityClass<T>,
    row: Record<string, any>,
    columnPrefix?: string
  ): T {
    return BaseEntity.mapper.mapRowToEntity(this, row, columnPrefix);
  }

  /**
   * Convert array of database rows to model instances
   */
  public static toModels<T extends BaseEntity>(
    this: EntityClass<T>,
    rows: Record<string, any>[],
    columnPrefix?: string
  ): T[] {
    return rows.map((row) =>
      BaseEntity.mapper.mapRowToEntity(this, row, columnPrefix)
    );
  }

  /**
   * Get table metadata for this entity
   */
  public static getTableMetadata<T extends BaseEntity>(this: EntityClass<T>) {
    return metadataStorage.getTable(this);
  }

  /**
   * Validate entity before database operations
   */
  public validate(): void {
    // Override in subclasses for custom validation
  }

  /**
   * Convert entity to plain object
   */
  public toPlain(): Record<string, any> {
    const plain: Record<string, any> = {};
    const table = metadataStorage.getTable(this.constructor as EntityClass);

    for (const column of table.columns) {
      const value = (this as any)[column.propertyKey];
      if (value !== undefined) {
        plain[column.propertyKey] = value;
      }
    }

    return plain;
  }

  /**
   * Clone the entity
   */
  public clone<T extends BaseEntity>(this: T): T {
    const Constructor = this.constructor as EntityClass<T>;
    const cloned = new Constructor();

    const table = metadataStorage.getTable(Constructor);

    for (const column of table.columns) {
      const value = (this as any)[column.propertyKey];
      if (value !== undefined) {
        (cloned as any)[column.propertyKey] = value;
      }
    }

    return cloned;
  }
}
