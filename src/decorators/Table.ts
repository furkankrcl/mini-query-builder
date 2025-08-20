import "reflect-metadata";
import { metadataStorage } from "../storage/MetadataStorage";
import { ITableOptions, EntityClass } from "../types";

/**
 * Table decorator for marking entity classes
 * @param options - Table configuration options
 */
export function Table(options: ITableOptions) {
  return function <T extends EntityClass>(constructor: T): T {
    // Validate options
    if (!options.name || options.name.trim() === "") {
      throw new Error("Table name cannot be empty");
    }

    metadataStorage.addTable(constructor, options.name);
    return constructor;
  };
}
