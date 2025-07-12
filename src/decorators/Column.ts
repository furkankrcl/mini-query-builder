import "reflect-metadata";
import { metadataStorage } from "../storage/MetadataStorage";

export function Column(options: { name: string }) {
  return function (target: any, propertyKey: string) {
    const constructor =
      typeof target === "function" ? target : target.constructor;
    metadataStorage.addColumn(constructor, propertyKey, options.name);
  };
}
