import "reflect-metadata";
import { metadataStorage } from "../storage/MetadataStorage";

export function Table(options: { name: string }) {
  return function (constructor: Function) {
    metadataStorage.addTable(constructor, options.name);
  };
}
