import { Column, OneToMany, Table } from "../../src";
import { Reminder } from "./Reminder";

@Table({ name: "pets" })
export class Pet {
  @Column({ name: "id" })
  id: number;

  @Column({ name: "name" })
  name: string;

  @Column({ name: "birth_date" })
  birthDate?: string;

  @OneToMany({
    selfReference: "id",
    targetTable: "reminders",
    targetColumn: "pet_id",
    targetClass: Reminder,
  })
  reminders: Reminder[];
}
