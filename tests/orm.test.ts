import "reflect-metadata";
import { describe, it, expect } from "vitest";

import { selectQuery } from "../src/query/selectQuery";
import { Pet } from "./__fixtures__/Pet";
import { insertQuery, metadataStorage } from "../src";
import { Reminder } from "./__fixtures__/Reminder";
import { updateQuery } from "../src/query/updateQuery";

describe("mini-orm", () => {
  it("should generate basic select query without relations", () => {
    const query = selectQuery(Pet);
    expect(query).toMatchInlineSnapshot(`
      "SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets"
    `);
  });

  it("should register OneToMany relation in metadataStorage", () => {
    const table = metadataStorage.getTable(Pet);
    expect(table.relations).toEqual([
      {
        type: "OneToMany",
        propertyKey: "reminders",
        selfReference: "id",
        targetTable: "reminders",
        targetColumn: "pet_id",
        targetClass: Reminder,
      },
    ]);
  });
  it("should generate select query with where clause and relations", () => {
    const query = selectQuery(Pet, {
      where: { id: 1, birthDate: "2020-01-01" },
    });
    expect(query).toMatchInlineSnapshot(`
      "SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets  WHERE pets.id = 1 AND pets.birth_date = '2020-01-01'"
    `);
  });

  it("should generate select query with relations", () => {
    const query = selectQuery(Pet, {
      relations: ["reminders"],
    });
    expect(query).toMatchInlineSnapshot(`
      "SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date, reminders.id AS reminders_id, reminders.pet_id AS reminders_pet_id, reminders.reminder_date AS reminders_reminder_date FROM pets pets LEFT JOIN reminders ON pets.id = reminders.pet_id"
    `);
  });

  it("should generate insert query from entity", () => {
    const pet = new Pet();
    pet.id = 1;
    pet.name = "Miyav";
    pet.birthDate = "2020-01-01";

    const query = insertQuery(pet);
    expect(query).toMatchInlineSnapshot(
      `"INSERT INTO pets(id, name, birth_date) VALUES(1, 'Miyav', '2020-01-01')"`
    );
  });

  it("should handle undefined values in insert query", () => {
    const pet = new Pet();
    pet.id = 2;

    const query = insertQuery(pet);
    expect(query).toMatchInlineSnapshot(
      `"INSERT INTO pets(id, name, birth_date) VALUES(2, NULL, NULL)"`
    );
  });

  it("should generate update query with where clause", () => {
    const pet = new Pet();
    pet.id = 1;
    pet.name = "Tekir";
    pet.birthDate = "2018-05-20";

    const query = updateQuery(Pet, pet, { where: { id: 1 } });
    expect(query).toMatchInlineSnapshot(
      `"UPDATE pets SET id = 1, name = 'Tekir', birth_date = '2018-05-20' WHERE id = 1"`
    );
  });

  it("should generate update query without where clause", () => {
    const pet = new Pet();
    pet.id = 2;
    pet.name = "Boncuk";

    const query = updateQuery(Pet, pet);
    expect(query).toMatchInlineSnapshot(
      `"UPDATE pets SET id = 2, name = 'Boncuk' "`
    );
  });

  it("should generate select query with advanced where clause", () => {
    const query = selectQuery(Pet, {
      where: {
        id: { $gt: 1 },
        name: { $like: "%Boncuk%" },
        birthDate: { $null: true },
      },
    });
    expect(query).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets  WHERE pets.id > 1 AND pets.name LIKE '%Boncuk%' AND pets.birth_date IS NULL"`
    );
  });
});
