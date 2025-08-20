import "reflect-metadata";
import { describe, it, expect } from "vitest";

import { selectQuery, isFunctionFactory } from "../src/query/selectQuery";
import { Pet } from "./__fixtures__/Pet";
import { insertQuery, metadataStorage } from "../src";
import { Reminder } from "./__fixtures__/Reminder";
import { updateQuery } from "../src/query/updateQuery";
import { CommoTypes } from "./__fixtures__/CommoTypes";
import { deleteQuery } from "../src/query/deleteQuery";

describe("mini-orm", () => {
  it("should generate basic select query without relations", () => {
    const { query: sql, params: parameters } = selectQuery(Pet);
    expect(sql).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets"`
    );
    expect(parameters).toEqual([]);
  });

  it("should register OneToMany relation in metadataStorage", () => {
    const table = metadataStorage.getTable(Pet);
    expect(table.relations).toEqual([
      expect.objectContaining({
        type: "OneToMany",
        propertyKey: "reminders",
        selfReference: "id",
        targetTable: "reminders",
        targetColumn: "pet_id",
      }),
    ]);
    const relationMetadata = table.relations?.[0];
    if (relationMetadata?.targetClass) {
      const actualClass = isFunctionFactory(relationMetadata.targetClass)
        ? relationMetadata.targetClass()
        : relationMetadata.targetClass;
      expect(actualClass).toBe(Reminder);
    }
  });
  it("should generate select query with where clause and relations", () => {
    const { query: sql, params: parameters } = selectQuery(Pet, {
      where: { id: 1, birthDate: "2020-01-01" },
    });
    expect(sql).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets WHERE pets.id = ? AND pets.birth_date = ?"`
    );

    expect(parameters).toEqual([1, "2020-01-01"]);
  });

  it("should generate select query with relations", () => {
    const { query: sql } = selectQuery(Pet, {
      relations: ["reminders"],
    });
    expect(sql).toMatchInlineSnapshot(`
      "SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date, reminders.id AS reminders_id, reminders.pet_id AS reminders_pet_id, reminders.reminder_date AS reminders_reminder_date FROM pets pets LEFT JOIN reminders ON pets.id = reminders.pet_id"
    `);
  });

  it("should generate select query with many-to-one relation", () => {
    const { query: sql } = selectQuery(Reminder, {
      relations: ["pet"],
    });
    expect(sql).toMatchInlineSnapshot(`
      "SELECT reminders.id AS reminders_id, reminders.pet_id AS reminders_pet_id, reminders.reminder_date AS reminders_reminder_date, pets.id AS pet_id, pets.name AS pet_name, pets.birth_date AS pet_birth_date FROM reminders reminders LEFT JOIN pets ON reminders.pet_id = pets.id"
    `);
  });

  it("should generate insert query from entity", () => {
    const pet = new Pet();
    pet.id = 1;
    pet.name = "Miyav";
    pet.birthDate = "2020-01-01";

    const { query: sql, params: parameters } = insertQuery(pet);
    expect(sql).toMatchInlineSnapshot(
      `"INSERT INTO pets(id, name, birth_date) VALUES(?, ?, ?)"`
    );
    expect(parameters).toEqual([1, "Miyav", "2020-01-01"]);
  });

  it("should handle undefined values in insert query", () => {
    const pet = new Pet();
    pet.id = 2;

    const { query: sql, params: parameters } = insertQuery(pet);
    expect(sql).toMatchInlineSnapshot(
      `"INSERT INTO pets(id, name, birth_date) VALUES(?, ?, ?)"`
    );
    expect(parameters).toEqual([2, null, null]);
  });

  it("should generate update query with where clause", () => {
    const pet = new Pet();
    pet.id = 1;
    pet.name = "Tekir";
    pet.birthDate = "2018-05-20";

    const { query: sql, params: parameters } = updateQuery(Pet, pet, {
      where: { id: 1 },
    });
    expect(sql).toMatchInlineSnapshot(
      `"UPDATE pets SET id = ?, name = ?, birth_date = ? WHERE id = ?"`
    );
    expect(parameters).toEqual([1, "Tekir", "2018-05-20", 1]);
  });

  it("should generate update query without where clause", () => {
    const pet = new Pet();
    pet.id = 2;
    pet.name = "Boncuk";

    const { query: sql, params: parameters } = updateQuery(Pet, pet);
    expect(sql).toMatchInlineSnapshot(`"UPDATE pets SET id = ?, name = ?"`);
    expect(parameters).toEqual([2, "Boncuk"]);
  });

  it("should generate select query with advanced where clause", () => {
    const { query: sql, params: parameters } = selectQuery(Pet, {
      where: {
        id: { $gt: 1 },
        name: { $like: "%Boncuk%" },
        birthDate: { $null: true },
      },
    });
    expect(sql).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets WHERE pets.id > ? AND pets.name LIKE ? AND pets.birth_date IS NULL"`
    );
    expect(parameters).toEqual([1, "%Boncuk%"]);
  });

  it("should map row data to ReminderEntity using toModel", () => {
    const row = {
      reminders_id: 1,
      reminders_pet_id: 123,
      reminders_reminder_date: "2024-01-01T00:00:00.000Z",
      reminder_pet_id: 123,
      pet_id: 123,
    };

    const reminder = Reminder.toModel(row);

    expect(reminder).toBeInstanceOf(Reminder);
    expect(reminder.id).toBe(row.reminders_id);
    expect(reminder.petId).toBe(row.reminders_pet_id);
    expect(reminder.reminderDate).toBe(row.reminders_reminder_date);
    // expect(reminder.pet).toBeInstanceOf(Pet);
    // expect(reminder.pet.id).toBe(row.pet_id);
  });

  it("should apply transformer on insertQuery", () => {
    const pet = new CommoTypes();
    pet.numberArr = [1, 2];
    pet.stringArr = ["a", "b"];
    pet.objCol = {
      a: "a",
      b: 1,
      c: true,
    };

    const { query: sql, params: parameters } = insertQuery(pet);
    // Soru işareti sayısı ile kolon sayısı eşit mi kontrol et
    const columnCount = sql.match(/\(([^)]+)\)/)?.[1].split(",").length || 0;
    const questionMarkCount = (sql.match(/\?/g) || []).length;
    expect(questionMarkCount).toBe(columnCount);

    expect(sql).toContain("number_arr");
    expect(sql).toContain("string_arr");
    expect(sql).toContain("obj_col");
    expect(parameters).include(JSON.stringify(pet.numberArr));
    expect(parameters).include(JSON.stringify(pet.stringArr));
    expect(parameters).include(JSON.stringify(pet.objCol));
  });

  it("should apply transformer on updateQuery", () => {
    const entity = new CommoTypes();
    entity.numberArr = [1, 2];
    entity.stringArr = ["a", "b"];
    entity.objCol = {
      a: "a",
      b: 1,
      c: true,
    };

    const whereNumberArr = [1, 3];

    const { query: sql, params: parameters } = updateQuery(CommoTypes, entity, {
      where: { numberArr: whereNumberArr },
    });

    expect(sql).toContain("number_arr");
    expect(sql).toContain("string_arr");
    expect(sql).toContain("obj_col");
    expect(parameters[0]).toEqual(JSON.stringify(entity.numberArr));
    expect(parameters[1]).toEqual(JSON.stringify(entity.stringArr));
    expect(parameters[2]).toEqual(JSON.stringify(entity.objCol));
    expect(parameters[3]).toEqual(JSON.stringify(whereNumberArr));
  });

  it("should apply transformer on toModel", () => {
    const expectedEntity = new CommoTypes();
    expectedEntity.numberArr = [1, 2];
    expectedEntity.stringArr = ["a", "b"];
    expectedEntity.objCol = {
      a: "a",
      b: 1,
      c: true,
    };
    const row = {
      _number_arr: JSON.stringify(expectedEntity.numberArr),
      _string_arr: JSON.stringify(expectedEntity.stringArr),
      _obj_col: JSON.stringify(expectedEntity.objCol),
    };

    const entity = CommoTypes.toModel(row, "_");
    expect(expectedEntity).toEqual(entity);
  });

  it("should generate delete query with where clause", () => {
    const { query: sql, params: parameters } = deleteQuery(Pet, {
      where: { id: 1 },
    });
    expect(sql).toMatchInlineSnapshot(`"DELETE FROM pets WHERE id = ?"`);
    expect(parameters).toEqual([1]);
  });

  it("should generate select query with orderBy clause", () => {
    const { query: sql, params: parameters } = selectQuery(Pet, {
      orderBy: { name: "ASC", birthDate: "DESC" },
    });
    expect(sql).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets ORDER BY pets.name ASC, pets.birth_date DESC"`
    );
    expect(parameters).toEqual([]);
  });

  it("should generate select query with where and orderBy clauses", () => {
    const { query: sql, params: parameters } = selectQuery(Pet, {
      where: { name: "Tekir" },
      orderBy: { birthDate: "DESC" },
    });
    expect(sql).toMatchInlineSnapshot(
      `"SELECT pets.id AS pets_id, pets.name AS pets_name, pets.birth_date AS pets_birth_date FROM pets pets WHERE pets.name = ? ORDER BY pets.birth_date DESC"`
    );
    expect(parameters).toEqual(["Tekir"]);
  });
});
