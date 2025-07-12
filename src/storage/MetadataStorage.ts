export interface ColumnMetadata {
  propertyKey: string;
  name: string;
}

export interface RelationMetadata {
  type: "OneToMany" | "ManyToOne";
  propertyKey: string;
  selfReference: string;
  targetTable: string;
  targetColumn: string;
  targetClass: Function;
}

export interface TableMetadata {
  name: string;
  columns: ColumnMetadata[];
  relations: RelationMetadata[];
}

class MetadataStorage {
  private tables = new Map<Function, TableMetadata>();
  private tmpTableColumns = new Map<Function, ColumnMetadata[]>();
  private tmpTableRelations = new Map<Function, RelationMetadata[]>();

  addTable(target: Function, name: string) {
    if (!this.tables.has(target)) {
      const columns = this.tmpTableColumns.get(target) || [];
      const relations = this.tmpTableRelations.get(target) || [];
      this.tables.set(target, { name, columns: columns, relations: relations });
      this.tmpTableColumns.delete(target);
      this.tmpTableRelations.delete(target);
    }
  }

  addColumn(target: Function, propertyKey: string, name: string) {
    const columns = this.tmpTableColumns.get(target) ?? [];
    columns.push({ propertyKey, name });
    this.tmpTableColumns.set(target, columns);
  }

  addRelation(target: Function, relation: RelationMetadata) {
    const relations = this.tmpTableRelations.get(target) ?? [];
    relations.push(relation);
    this.tmpTableRelations.set(target, relations);
  }

  getTable(target: Function): TableMetadata {
    const table = this.tables.get(target);
    if (!table) {
      throw new Error(`Table metadata not found for class: ${target.name}`);
    }
    return table;
  }
}

export const metadataStorage = new MetadataStorage();
