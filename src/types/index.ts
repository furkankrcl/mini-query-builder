// Core Types and Interfaces
export type EntityClass<T = any> = new (...args: any[]) => T;
export type SortDirection = "ASC" | "DESC";

// Query Result Interface
export interface IQueryResult {
  query: string;
  params: any[];
}

// Metadata Interfaces
export interface ITableMetadata {
  name: string;
  entityClass: EntityClass;
  columns: IColumnMetadata[];
  relations: IRelationMetadata[];
}

export interface IColumnMetadata {
  name: string;
  propertyKey: string;
  type?: string;
  isPrimary?: boolean;
  isGenerated?: boolean;
  isNullable?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  unique?: boolean;
  default?: any;
  comment?: string;
  transformer?: IValueTransformer;
  excludeFromUpdate?: boolean;
  excludeFromInsert?: boolean;
}

export interface IRelationMetadata {
  propertyKey: string;
  type: "OneToMany" | "ManyToOne";
  targetClass: EntityClass | (() => EntityClass);
  selfReference: string;
  targetTable: string;
  targetColumn: string;
  cascade?: boolean;
  nullable?: boolean;
  eager?: boolean;
}

// Value Transformer Interface
export interface IValueTransformer<T = any, U = any> {
  to(value: T): U;
  from(value: U): T;
}

// Decorator Options
export interface ITableOptions {
  name?: string;
}

export interface IColumnOptions {
  name?: string;
  type?: string;
  primary?: boolean;
  generated?: boolean;
  nullable?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  unique?: boolean;
  default?: any;
  comment?: string;
  transformer?: IValueTransformer;
  excludeFromUpdate?: boolean;
  excludeFromInsert?: boolean;
}

export interface IRelationOptions {
  inverse?: string;
  joinColumn?: string;
  referencedColumn?: string;
  cascade?: boolean;
  nullable?: boolean;
  eager?: boolean;
  selfReference: string;
  targetTable: string;
  targetColumn: string;
  targetClass: EntityClass | (() => EntityClass);
}

// JOIN Types
export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

// Relation Configuration for Query Builder
export interface IRelationConfig {
  joinType?: JoinType;
  where?: (alias: string) => string;
}

// Type for relation specifications
export interface RelationSpec<T = any> {
  relationName: RelationKeys<T>;
  config?: IRelationConfig;
}

// Utility type to extract relation keys from an entity
export type RelationKeys<T> = {
  [K in keyof T]: T[K] extends any[] ? K : T[K] extends object ? K : never;
}[keyof T] extends never
  ? string
  : {
      [K in keyof T]: T[K] extends any[] ? K : T[K] extends object ? K : never;
    }[keyof T];

// Error Classes
export class MetadataNotFoundError extends Error {
  constructor(entityName: string) {
    super(`Metadata not found for entity: ${entityName}`);
    this.name = "MetadataNotFoundError";
  }
}

export class InvalidRelationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRelationError";
  }
}

export class UnsupportedOperatorError extends Error {
  constructor(operator: string) {
    super(`Unsupported operator: ${operator}`);
    this.name = "UnsupportedOperatorError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class QueryBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryBuildError";
  }
}

export class TransformationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransformationError";
  }
}
