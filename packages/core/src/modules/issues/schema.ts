import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import {
  createFromDataModel,
  DrizzleModelTypes,
} from "../../lib/drizzle/utils";
import { Schema } from "effect";
import { organization } from "../auth/schema";

const properties = {
  id: "id",
  title: "title",
  description: "description",
  organizationId: "organizationId",
} as const;

const fromIssues = createFromDataModel(properties);

const model = fromIssues(({ id, title, description, organizationId }) => {
  // sql
  const table = pgTable("issue", {
    [id]: uuid()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    [title]: text().notNull(),
    [description]: text().notNull(),
    [organizationId]: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  });

  // select
  const schema = Schema.Struct({
    [id]: Schema.UUID,
    [title]: Schema.String,
    [description]: Schema.String,
    [organizationId]: Schema.String,
  });

  // insert
  const schemaInsert = Schema.Struct({
    ...schema.fields,
    [id]: schema.fields[id].pipe(Schema.optional),
  });

  return { table, schema, schemaInsert };
});

export const issueTable = model.table;

type IssueTypes = DrizzleModelTypes<typeof issueTable>;

export type Issue = IssueTypes["Select"];
export type IssueInsert = IssueTypes["Insert"];

export const Issue = model.schema;
export const IssueInsert = model.schemaInsert;
