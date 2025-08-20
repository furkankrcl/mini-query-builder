import {
  IMetadataStorage,
  IMetadataValidator,
  DefaultMetadataValidator,
} from "../metadata/interfaces";
import {
  ITableMetadata,
  IColumnMetadata,
  IRelationMetadata,
  EntityClass,
  MetadataNotFoundError,
} from "../types";

/**
 * Enhanced metadata storage with SOLID principles
 */
class MetadataStorage implements IMetadataStorage {
  private readonly tables = new Map<EntityClass, ITableMetadata>();
  private readonly tmpTableColumns = new Map<EntityClass, IColumnMetadata[]>();
  private readonly tmpTableRelations = new Map<
    EntityClass,
    IRelationMetadata[]
  >();
  private readonly validator: IMetadataValidator;

  constructor(validator: IMetadataValidator = new DefaultMetadataValidator()) {
    this.validator = validator;
  }

  /**
   * Add table metadata with validation
   */
  addTable(target: EntityClass, name: string): void {
    if (this.tables.has(target)) {
      return; // Already exists
    }

    const columns = this.tmpTableColumns.get(target) || [];
    const relations = this.tmpTableRelations.get(target) || [];

    const tableMetadata: ITableMetadata = {
      name,
      entityClass: target,
      columns,
      relations,
    };

    // Validate before storing
    this.validator.validateTable(tableMetadata);

    this.tables.set(target, tableMetadata);
    this.tmpTableColumns.delete(target);
    this.tmpTableRelations.delete(target);
  }

  /**
   * Add column metadata with validation
   */
  addColumn(
    target: EntityClass,
    propertyKey: string,
    name: string,
    transformer?: IColumnMetadata["transformer"],
    excludeFromUpdate = false,
    excludeFromInsert = false
  ): void {
    const columnMetadata: IColumnMetadata = {
      propertyKey,
      name,
      transformer,
      excludeFromUpdate,
      excludeFromInsert,
    };

    // Validate before storing
    this.validator.validateColumn(columnMetadata);

    const columns = this.tmpTableColumns.get(target) ?? [];

    // Check for duplicate column names
    const existingColumn = columns.find(
      (col) => col.name === name || col.propertyKey === propertyKey
    );
    if (existingColumn) {
      throw new Error(`Duplicate column definition: ${name} (${propertyKey})`);
    }

    columns.push(columnMetadata);
    this.tmpTableColumns.set(target, columns);
  }

  /**
   * Add relation metadata with validation
   */
  addRelation(target: EntityClass, relation: IRelationMetadata): void {
    // Validate before storing
    this.validator.validateRelation(relation);

    const relations = this.tmpTableRelations.get(target) ?? [];

    // Check for duplicate relations
    const existingRelation = relations.find(
      (rel) => rel.propertyKey === relation.propertyKey
    );
    if (existingRelation) {
      throw new Error(`Duplicate relation definition: ${relation.propertyKey}`);
    }

    relations.push(relation);
    this.tmpTableRelations.set(target, relations);
  }

  /**
   * Get table metadata with error handling
   */
  getTable(target: EntityClass): ITableMetadata {
    const table = this.tables.get(target);
    if (!table) {
      throw new MetadataNotFoundError(target.name);
    }
    return table;
  }

  /**
   * Get column by property key
   */
  getColumnByPropertyKey(
    tableName: string,
    propertyKey: string
  ): IColumnMetadata | undefined {
    for (const table of this.tables.values()) {
      if (table.name === tableName) {
        return table.columns.find((col) => col.propertyKey === propertyKey);
      }
    }
    return undefined;
  }

  /**
   * Check if table metadata exists
   */
  hasTable(target: EntityClass): boolean {
    return this.tables.has(target);
  }

  /**
   * Get all table metadata (for debugging/introspection)
   */
  getAllTables(): Map<EntityClass, ITableMetadata> {
    return new Map(this.tables);
  }

  /**
   * Clear all metadata (useful for testing)
   */
  clear(): void {
    this.tables.clear();
    this.tmpTableColumns.clear();
    this.tmpTableRelations.clear();
  }

  /**
   * Get table metadata by table name
   */
  getTableByName(tableName: string): ITableMetadata | undefined {
    for (const table of this.tables.values()) {
      if (table.name === tableName) {
        return table;
      }
    }
    return undefined;
  }
}

/**
 * Global metadata storage instance
 */
export const metadataStorage = new MetadataStorage();

// Export types for backwards compatibility
export type ColumnMetadata = IColumnMetadata;
export type RelationMetadata = IRelationMetadata;
export type TableMetadata = ITableMetadata;
