import { metadataStorage } from "../storage/MetadataStorage";
import { IRelationOptions } from "../types";

/**
 * OneToMany relation decorator
 * @param options - Relation configuration options
 */
export function OneToMany(options: IRelationOptions) {
  return function (target: any, propertyKey: string): void {
    // Validate options
    if (!propertyKey || propertyKey.trim() === "") {
      throw new Error("Property key cannot be empty");
    }

    if (!options.selfReference || options.selfReference.trim() === "") {
      throw new Error("Self reference cannot be empty");
    }

    if (!options.targetTable || options.targetTable.trim() === "") {
      throw new Error("Target table cannot be empty");
    }

    if (!options.targetColumn || options.targetColumn.trim() === "") {
      throw new Error("Target column cannot be empty");
    }

    if (!options.targetClass) {
      throw new Error("Target class cannot be null");
    }

    metadataStorage.addRelation(target.constructor, {
      type: "OneToMany",
      propertyKey,
      ...options,
    });
  };
}
