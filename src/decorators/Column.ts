import "reflect-metadata";
import { metadataStorage } from "../storage/MetadataStorage";
import { IColumnOptions } from "../types";

/**
 * Column decorator for marking entity properties
 * @param options - Column configuration options
 */
export function Column(options: IColumnOptions) {
  return function (target: any, propertyKey: string): void {
    // Validate options
    if (!options.name || options.name.trim() === "") {
      throw new Error("Column name cannot be empty");
    }

    if (!propertyKey || propertyKey.trim() === "") {
      throw new Error("Property key cannot be empty");
    }

    const constructor =
      typeof target === "function" ? target : target.constructor;

    metadataStorage.addColumn(
      constructor,
      propertyKey,
      options.name,
      options.transformer,
      options.excludeFromUpdate ?? false,
      options.excludeFromInsert ?? false
    );
  };
}
