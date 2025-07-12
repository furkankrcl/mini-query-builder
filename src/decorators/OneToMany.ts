import { metadataStorage } from "../storage/MetadataStorage";

export function OneToMany(options: {
  selfReference: string;
  targetTable: string;
  targetColumn: string;
  targetClass: Function;
}) {
  return function (target: any, propertyKey: string) {
    metadataStorage.addRelation(target.constructor, {
      type: "OneToMany",
      propertyKey,
      ...options,
    });
  };
}
