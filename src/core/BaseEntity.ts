import { metadataStorage } from "../storage/MetadataStorage";

export abstract class BaseEntity {
  constructor() {}
  public static toModel<T extends BaseEntity>(
    this: new () => T,
    row: any,
    columnPrefix?: string
  ): T {
    const instance = new this();
    const table = metadataStorage.getTable(this);
    const colPrefix = columnPrefix ? columnPrefix : `${table.name}_`;

    for (const column of table.columns) {
      const key = `${colPrefix}${column.name}`;
      if (key in row) {
        (instance as any)[column.propertyKey] = row[key];
      }
    }

    // for (const relation of table.relations) {
    //   const TargetClass =
    //     typeof relation.targetClass === "function"
    //       ? relation.targetClass()
    //       : undefined;
    //   if (relation.type === "ManyToOne" && TargetClass) {
    //     const relatedKey = `${relation.propertyKey}_${relation.targetColumn}`;
    //     if (relatedKey in row) {
    //       //   const TargetClass = relation.targetClass as new () => any;
    //       (instance as any)[relation.propertyKey] = new TargetClass();
    //       (instance as any)[relation.propertyKey].id = row[relatedKey];
    //     }
    //   } else if (relation.type === "OneToMany") {
    //     // Handle OneToMany relations if needed
    //     (instance as any)[relation.propertyKey] = [];
    //   }
    // }

    return instance;
  }
}
