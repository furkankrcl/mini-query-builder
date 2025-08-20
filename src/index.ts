import "reflect-metadata";

// Core types and interfaces
export * from "./types";
export * from "./where";
export * from "./metadata/interfaces";

// Transformers
export { CommonTransformers } from "./transformers";

// Decorators
export * from "./decorators/Table";
export * from "./decorators/Column";
export * from "./decorators/OneToMany";
export * from "./decorators/ManyToOne";

// Query builders (new class-based approach)
export * from "./query/interfaces";
export * from "./query/factory";
export { SelectQueryBuilder } from "./query/selectQuery";
export { InsertQueryBuilder } from "./query/insertQuery";
export { UpdateQueryBuilder } from "./query/updateQuery";
export { DeleteQueryBuilder } from "./query/deleteQuery";
export { WhereClauseBuilder } from "./query/whereClause";

// Legacy function-based query builders (for backwards compatibility)
export { selectQuery } from "./query/selectQuery";
export { insertQuery } from "./query/insertQuery";
export { updateQuery } from "./query/updateQuery";
export { deleteQuery } from "./query/deleteQuery";

// Core classes
export * from "./core/BaseEntity";

// Storage
export * from "./storage/MetadataStorage";
