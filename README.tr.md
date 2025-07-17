# mini-query-builder

`mini-query-builder`, TypeScript tabanlı hafif bir SQL sorgu oluşturucusudur. Bu paket, `INSERT`, `UPDATE`, `SELECT` ve `DELETE` sorgularını kolayca, güvenli ve parametrik şekilde oluşturmanı sağlar. React Native projeleri dahil olmak üzere birçok platformda kullanılabilir.

> NOT: Bu paket, kendi ihtiyacım için yazılmıştır; basit SQL sorguları üretir, çok büyük beklentileriniz olmasın. :)

## 📖 Diğer Diller

- [English (README.md)](README.md)

## 🚀 Özellikler

- ✅ Parametrik sorgu üretimi (`?` placeholder ile SQL injection'a karşı güvenli)
- ✅ `WHERE` koşulları için gelişmiş karşılaştırma operatörleri (`=`, `!=`, `<`, `<=`, `>`, `>=`, `IN`, `LIKE`)
- ✅ Otomatik `null` ve `undefined` desteği
- ✅ `@Table`, `@Column`, `@OneToMany`, `@ManyToOne` gibi TypeScript dekoratörleriyle tanımlı Entity desteği
- ✅ React Native ile uyumlu (örnek kullanım: SQLite)

## 📦 Kurulum

```bash
npm install mini-query-builder
# veya
yarn add mini-query-builder
```

## 🧱 Temel Kullanım

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

## 🔎 WHERE Kullanımı

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

Desteklenen operatörler:

- `$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$like`

## 🏗 Entity Tanımı

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

## 🛠 Geliştirme

Bu proje TypeScript ile yazılmıştır ve hem backend hem de frontend ortamlarında kullanılmak üzere optimize edilmiştir.

## 📄 Lisans

MIT
