# mini-query-builder

`mini-query-builder` is a lightweight SQL query builder based on TypeScript. It allows you to create `INSERT`, `UPDATE`, `SELECT`, and `DELETE` queries easily, securely, and parametrically. It can be used in various environments including React Native projects.

> NOTE: This package was originally written for my personal use. It generates simple SQL queries, so don’t expect too much from it. :)

## 📖 Other Languages

- [Türkçe (README.tr.md)](README.tr.md)

## 🚀 Features

- ✅ Parameterized query generation (safe against SQL injection using `?` placeholders)
- ✅ Advanced comparison operators in `WHERE` conditions (`=`, `!=`, `<`, `<=`, `>`, `>=`, `IN`, `LIKE`)
- ✅ Automatic `null` and `undefined` handling
- ✅ Entity support defined with TypeScript decorators like `@Table`, `@Column`, `@OneToMany`, `@ManyToOne`
- ✅ Compatible with React Native (example usage: SQLite)

## 📦 Installation

```bash
npm install mini-query-builder
# or
yarn add mini-query-builder
```

## 🧱 Basic Usage

```ts
import {
  insertQuery,
  updateQuery,
  deleteQuery,
  selectQuery,
} from "mini-query-builder";
import { Pet } from "./entities/Pet.entity";
import db from "<YOUR_DATABASE>";

const pet = new Pet();
pet.id = 1;
pet.name = "Mırmır";
pet.species = "cat";

const { query, params } = insertQuery(Pet, pet);
// query: "INSERT INTO pets(id, name, species) VALUES(?, ?, ?)"
// params: [1, "Mırmır", "cat"]
```

## 🔎 Using WHERE Clause

```ts
const { query, params } = selectQuery(Pet, {
  where: {
    species: "dog",
    birthDate: { $gte: "2022-01-01" },
    name: { $like: "%Max%" },
    id: { $in: [1, 2, 3] },
  },
});
const rows = db(query, params);
const pet: Pet = Pet.toModel(rows[0]);
```

Supported operators:

- `$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$like`

## 🏗 Entity Definition

```ts
import { BaseEntity, Column, Table } from "mini-query-builder";

@Table("pets")
export class Pet extends BaseEntity {
  @Column({ name: "id", excludeFromUpdate: true })
  id!: number;

  @Column({ name: "name" })
  name!: string;

  @Column({ name: "species" })
  species!: string;

  @Column({
    name: "birth_date",
    transforms: {
      to: (value: Date | undefined) => (value ? value.toISOString() : null),
      from: (value: string | null) => (value ? new Date(value) : undefined),
    },
  })
  birthDate?: Date;
}
```

## 🧪 Test

```bash
npm run test
```

## 🛠 Development

This project is written in TypeScript and optimized for use in both backend and frontend environments.

## 📄 License

MIT
