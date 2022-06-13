# prisma-schema-transform

## Install

```bash
yarn add --dev https://github.com/appbasecamp/prisma-schema-transform.git
```

## Usage

```bash
yarn prisma-schema-transform prisma/schema.prisma
```

## More about my solution

Write a `prisma/preSchema.prisma` and add it to git

Add `prisma/schema.prisma` to `.gitignore`

Add `package.json` scripts

```json
  "scripts": {
    "schema": "cp prisma/preSchema.prisma prisma/schema.prisma && yarn prisma-schema-transform prisma/schema.prisma",
    "migrate": "yarn schema && yarn prisma migrate dev --name"
  }
```

transformer schema only

```bash
yarn schema
```

transformer schema and migrate

```bash
yarn migrate init
```

## Example

write `prisma/preSchema.prisma` with `snake_case`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model user {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  hello_world  String?
  posts post[]
}

model post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    user?    @relation(fields: [author_id], references: [id])
  author_id  Int?
}
```

## Usage

```bash
$ prisma-schema-transform prisma/schema.prisma
```

```
Usage
  $ prisma-schema-transform [options] [...args]

Specify a schema:
  $ prisma-schema-transform ./schema.prisma

Instead of saving the result to the filesystem, you can also print it
  $ prisma-schema-transform ./schema.prisma --print

Exclude some models from the output
  $ prisma-schema-transform ./schema.prisma --deny knex_migrations --deny knex_migration_lock

Options:
  --print   Do not save
  --deny    Exlucde model from output
  --help    Help
  --version Version info
```

## Motivation

Using `snake_case` in database and automatically transform generated Prisma schema to `camelCase` with `@map` and `@@map` as needed to map the new name back to the database.

There is a [snippet](https://github.com/prisma/prisma/issues/1934#issuecomment-618063631) provided by @TLadd, but I found regex a bit unreliable.

## License

This project is [MIT licensed](./LICENSE).
