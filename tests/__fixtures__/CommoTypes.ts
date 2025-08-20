import { BaseEntity, Column, Table, CommonTransformers } from "../../src";

@Table({ name: "commo_types" })
export class CommoTypes extends BaseEntity {
  @Column({
    name: "number_arr",
    transformer: CommonTransformers.NUMBER_ARRAY,
  })
  numberArr: number[];

  @Column({
    name: "string_arr",
    transformer: CommonTransformers.STRING_ARRAY,
  })
  stringArr: string[];

  @Column({
    name: "obj_col",
    transformer: CommonTransformers.JSON,
  })
  objCol: any;
}
