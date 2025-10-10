import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { DrizzleModelTypes } from "../../lib/drizzle/utils";

export const userTable = pgTable("user", {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: text().notNull(),
  name: text().notNull(),
  image: text().notNull(),
});

type UserTypes = DrizzleModelTypes<typeof userTable>;

export type User = UserTypes["Select"];
export type UserInsert = UserTypes["Insert"];
