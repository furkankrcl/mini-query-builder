import "reflect-metadata";
import { describe, it, expect } from "vitest";

import {
  queryBuilderFactory,
  CommonTransformers,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  InsertQueryBuilder,
} from "../src";
import { Pet } from "./__fixtures__/Pet";

describe("Enhanced Features", () => {
  describe("Query Builder Factory", () => {
    it("should create SELECT query builder", () => {
      const builder = queryBuilderFactory.createSelect(Pet);
      expect(builder).toBeInstanceOf(SelectQueryBuilder);
    });

    it("should create UPDATE query builder", () => {
      const builder = queryBuilderFactory.createUpdate(Pet);
      expect(builder).toBeInstanceOf(UpdateQueryBuilder);
    });

    it("should create DELETE query builder", () => {
      const builder = queryBuilderFactory.createDelete(Pet);
      expect(builder).toBeInstanceOf(DeleteQueryBuilder);
    });

    it("should create INSERT query builder", () => {
      const builder = queryBuilderFactory.createInsert(Pet);
      expect(builder).toBeInstanceOf(InsertQueryBuilder);
    });
  });

  describe("Fluent API", () => {
    it("should build SELECT query with fluent API", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ id: { $gte: 1 } })
        .orderBy("name", "ASC")
        .limit(10)
        .offset(5)
        .build();

      expect(sql).toContain("WHERE");
      expect(sql).toContain("ORDER BY");
      expect(sql).toContain("LIMIT 10");
      expect(sql).toContain("OFFSET 5");
      expect(parameters).toEqual([1]);
    });

    it("should build UPDATE query with fluent API", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createUpdate(Pet)
        .set({ name: "Updated Pet" })
        .where({ id: 1 })
        .build();

      expect(sql).toMatchInlineSnapshot(
        `"UPDATE pets SET name = ? WHERE id = ?"`
      );
      expect(parameters).toEqual(["Updated Pet", 1]);
    });

    it("should build DELETE query with fluent API", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createDelete(Pet)
        .where({ id: { $lt: 10 } })
        .build();

      expect(sql).toMatchInlineSnapshot(`"DELETE FROM pets WHERE id < ?"`);
      expect(parameters).toEqual([10]);
    });

    it("should build INSERT query with fluent API", () => {
      const pet = new Pet();
      pet.id = 1;
      pet.name = "Fluffy";

      const { query: sql, params: parameters } = queryBuilderFactory
        .createInsert(Pet)
        .values(pet)
        .build();

      expect(sql).toContain("INSERT INTO pets");
      expect(parameters).include(1);
      expect(parameters).include("Fluffy");
    });
  });

  describe("Common Transformers", () => {
    it("should have JSON transformer", () => {
      const data = { test: "value" };
      const transformed = CommonTransformers.JSON.to(data);
      const restored = CommonTransformers.JSON.from(transformed);

      expect(transformed).toBe(JSON.stringify(data));
      expect(restored).toEqual(data);
    });

    it("should have NUMBER_ARRAY transformer", () => {
      const numbers = [1, 2, 3];
      const transformed = CommonTransformers.NUMBER_ARRAY.to(numbers);
      const restored = CommonTransformers.NUMBER_ARRAY.from(transformed);

      expect(transformed).toBe(JSON.stringify(numbers));
      expect(restored).toEqual(numbers);
    });

    it("should have STRING_ARRAY transformer", () => {
      const strings = ["a", "b", "c"];
      const transformed = CommonTransformers.STRING_ARRAY.to(strings);
      const restored = CommonTransformers.STRING_ARRAY.from(transformed);

      expect(transformed).toBe(JSON.stringify(strings));
      expect(restored).toEqual(strings);
    });

    it("should handle null values in transformers", () => {
      expect(CommonTransformers.JSON.to(null)).toBe(null);
      expect(CommonTransformers.JSON.from(null)).toBe(undefined);

      expect(CommonTransformers.NUMBER_ARRAY.to([])).toBe(null);
      expect(CommonTransformers.NUMBER_ARRAY.from(null)).toEqual([]);
    });
  });

  describe("Enhanced WHERE operators", () => {
    it("should support $gte operator", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ id: { $gte: 5 } })
        .build();

      expect(sql).toContain("id >= ?");
      expect(parameters).toEqual([5]);
    });

    it("should support $lte operator", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ id: { $lte: 10 } })
        .build();

      expect(sql).toContain("id <= ?");
      expect(parameters).toEqual([10]);
    });

    it("should support $not operator", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ name: { $not: "Blackie" } })
        .build();

      expect(sql).toContain("name != ?");
      expect(parameters).toEqual(["Blackie"]);
    });

    it("should support $null operator", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ birthDate: { $null: true } })
        .build();

      expect(sql).toContain("birth_date IS NULL");
      expect(parameters).toEqual([]);
    });

    it("should support $in operator", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ id: { $in: [1, 2, 3] } })
        .build();

      expect(sql).toContain("id IN (?, ?, ?)");
      expect(parameters).toEqual([1, 2, 3]);
    });
  });

  describe("BaseEntity enhancements", () => {
    it("should provide toPlain method", () => {
      const pet = new Pet();
      pet.id = 1;
      pet.name = "Fluffy";
      pet.birthDate = "2020-01-01";

      const plain = pet.toPlain();

      expect(plain).toEqual({
        id: 1,
        name: "Fluffy",
        birthDate: "2020-01-01",
      });
    });

    it("should provide clone method", () => {
      const original = new Pet();
      original.id = 1;
      original.name = "Original";

      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(Pet);
      expect(cloned).not.toBe(original);
      expect(cloned.id).toBe(original.id);
      expect(cloned.name).toBe(original.name);
    });

    it("should provide toModels static method", () => {
      const rows = [
        { pets_id: 1, pets_name: "Pet1", pets_birth_date: "2020-01-01" },
        { pets_id: 2, pets_name: "Pet2", pets_birth_date: "2020-02-01" },
      ];

      const pets = Pet.toModels(rows);

      expect(pets).toHaveLength(2);
      expect(pets[0]).toBeInstanceOf(Pet);
      expect(pets[0].id).toBe(1);
      expect(pets[0].name).toBe("Pet1");
      expect(pets[1].id).toBe(2);
      expect(pets[1].name).toBe("Pet2");
    });
  });

  describe("Batch Insert", () => {
    it("should support batch insert", () => {
      const pets = [
        Object.assign(new Pet(), { id: 1, name: "Pet1" }),
        Object.assign(new Pet(), { id: 2, name: "Pet2" }),
        Object.assign(new Pet(), { id: 3, name: "Pet3" }),
      ];

      const { query: sql, params: parameters } = queryBuilderFactory
        .createInsert(Pet)
        .valuesArray(pets)
        .build();

      expect(sql).toContain("INSERT INTO pets");
      expect(sql).toContain("VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)");
      expect(parameters).toHaveLength(9); // 3 pets * 3 columns each
      expect(parameters).toEqual([
        1,
        "Pet1",
        null,
        2,
        "Pet2",
        null,
        3,
        "Pet3",
        null,
      ]);
    });
  });

  describe("Oylesine test", () => {
    it("test 1", () => {
      const { query: sql, params: parameters } = queryBuilderFactory
        .createSelect(Pet)
        .where({ name: { $null: false } })
        .build();

      expect(true).toBe(true);
    });
  });
});
