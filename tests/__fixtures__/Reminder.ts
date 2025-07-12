import { Column, ManyToOne, Table } from "../../src";
import { Pet } from "./Pet";

@Table({ name: "reminders" })
export class Reminder {
  @Column({ name: "id" })
  id: number;

  @Column({ name: "pet_id" })
  petId: number;

  @Column({ name: "reminder_date" })
  reminderDate: string;

  @ManyToOne({
    selfReference: "pet_id",
    targetTable: "pets",
    targetColumn: "id",
    targetClass: Pet,
  })
  pet: Pet;
}
