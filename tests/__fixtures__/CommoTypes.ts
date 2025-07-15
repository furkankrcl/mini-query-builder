import { BaseEntity, Column, Table } from "../../src";

@Table({ name: "commo_types" })
export class CommoTypes extends BaseEntity {
  @Column({
    name: "number_arr",
    transformer: {
      to: (val: number[]) => (val ? JSON.stringify(val) : null),
      from: (val: string) => (val ? JSON.parse(val) : undefined),
    },
  })
  numberArr: number[];

  @Column({
    name: "string_arr",
    transformer: {
      to: (val: string[]) => (val ? JSON.stringify(val) : null),
      from: (val: string) => (val ? JSON.parse(val) : undefined),
    },
  })
  stringArr: string[];

  @Column({
    name: "obj_col",
    transformer: {
      to: (val: any) => (val ? JSON.stringify(val) : null),
      from: (val: string) => (val ? JSON.parse(val) : undefined),
    },
  })
  objCol: any;
}
