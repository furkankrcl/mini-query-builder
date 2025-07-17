import "reflect-metadata";
import { ColumnMetadata, metadataStorage } from "../storage/MetadataStorage";

export function Column(options: {
  name: string;
  transformer?: ColumnMetadata["transformer"];
  excludeFromUpdate?: boolean;
  excludeFromInsert?: boolean;
}) {
  return function (target: any, propertyKey: string) {
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
