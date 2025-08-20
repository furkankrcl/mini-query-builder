import {
  ITableMetadata,
  IColumnMetadata,
  IRelationMetadata,
  EntityClass,
  MetadataNotFoundError,
  InvalidRelationError,
} from "../types";

/**
 * Interface for metadata storage operations
 */
export interface IMetadataStorage {
  /**
   * Add table metadata
   */
  addTable(target: EntityClass, name: string): void;

  /**
   * Add column metadata
   */
  addColumn(
    target: EntityClass,
    propertyKey: string,
    name: string,
    transformer?: IColumnMetadata["transformer"],
    excludeFromUpdate?: boolean,
    excludeFromInsert?: boolean
  ): void;

  /**
   * Add relation metadata
   */
  addRelation(target: EntityClass, relation: IRelationMetadata): void;

  /**
   * Get table metadata
   */
  getTable(target: EntityClass): ITableMetadata;

  /**
   * Get column by property key
   */
  getColumnByPropertyKey(
    tableName: string,
    propertyKey: string
  ): IColumnMetadata | undefined;

  /**
   * Check if table exists
   */
  hasTable(target: EntityClass): boolean;

  /**
   * Get all tables
   */
  getAllTables(): Map<EntityClass, ITableMetadata>;
}

/**
 * Interface for metadata readers
 */
export interface IMetadataReader {
  /**
   * Read table metadata from entity class
   */
  getTableMetadata(target: EntityClass): ITableMetadata;

  /**
   * Read column metadata from entity class
   */
  getColumnMetadata(target: EntityClass): IColumnMetadata[];

  /**
   * Read relation metadata from entity class
   */
  getRelationMetadata(target: EntityClass): IRelationMetadata[];
}

/**
 * Interface for metadata validators
 */
export interface IMetadataValidator {
  /**
   * Validate table metadata
   */
  validateTable(metadata: ITableMetadata): void;

  /**
   * Validate column metadata
   */
  validateColumn(metadata: IColumnMetadata): void;

  /**
   * Validate relation metadata
   */
  validateRelation(metadata: IRelationMetadata): void;
}

/**
 * Default metadata validator implementation
 */
export class DefaultMetadataValidator implements IMetadataValidator {
  validateTable(metadata: ITableMetadata): void {
    if (!metadata.name || metadata.name.trim() === "") {
      throw new Error("Table name cannot be empty");
    }

    if (metadata.columns.length === 0) {
      throw new Error(`Table '${metadata.name}' must have at least one column`);
    }

    metadata.columns.forEach((column) => this.validateColumn(column));
    metadata.relations.forEach((relation) => this.validateRelation(relation));
  }

  validateColumn(metadata: IColumnMetadata): void {
    if (!metadata.name || metadata.name.trim() === "") {
      throw new Error("Column name cannot be empty");
    }

    if (!metadata.propertyKey || metadata.propertyKey.trim() === "") {
      throw new Error("Column property key cannot be empty");
    }
  }

  validateRelation(metadata: IRelationMetadata): void {
    if (!metadata.propertyKey || metadata.propertyKey.trim() === "") {
      throw new Error("Relation property key cannot be empty");
    }

    if (!metadata.selfReference || metadata.selfReference.trim() === "") {
      throw new Error("Relation self reference cannot be empty");
    }

    if (!metadata.targetTable || metadata.targetTable.trim() === "") {
      throw new Error("Relation target table cannot be empty");
    }

    if (!metadata.targetColumn || metadata.targetColumn.trim() === "") {
      throw new Error("Relation target column cannot be empty");
    }

    if (!metadata.targetClass) {
      throw new Error("Relation target class cannot be null");
    }

    if (!["OneToMany", "ManyToOne"].includes(metadata.type)) {
      throw new Error(`Invalid relation type: ${metadata.type}`);
    }
  }
}
