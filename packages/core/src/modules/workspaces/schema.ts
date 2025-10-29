import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { Schema } from "effect";
import { user } from "../auth/schema";
import {
  createFromDataModel,
  DrizzleModelTypes,
} from "../../lib/drizzle/utils";

// Workspace table and membership model

const workspaceProps = {
  id: "id",
  slug: "slug",
  name: "name",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

const fromWorkspace = createFromDataModel(workspaceProps);

const workspaceModel = fromWorkspace(
  ({ id, slug, name, createdAt, updatedAt }) => {
    // sql
    const table = pgTable("workspace", {
      [id]: uuid()
        .default(sql`gen_random_uuid()`)
        .primaryKey(),
      [slug]: text().notNull().unique(),
      [name]: text().notNull(),
      [createdAt]: timestamp("created_at").defaultNow().notNull(),
      [updatedAt]: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    });

    // select
    const schema = Schema.Struct({
      [id]: Schema.UUID,
      [slug]: Schema.String,
      [name]: Schema.String,
      [createdAt]: Schema.DateFromSelf,
      [updatedAt]: Schema.DateFromSelf,
    });

    // insert
    const schemaInsert = Schema.Struct({
      [slug]: Schema.String,
      [name]: Schema.String,
    });

    return { table, schema, schemaInsert };
  },
);

export const workspaceTable = workspaceModel.table;
export type Workspace = DrizzleModelTypes<typeof workspaceTable>["Select"];
export type WorkspaceInsert = DrizzleModelTypes<
  typeof workspaceTable
>["Insert"];
export const Workspace = workspaceModel.schema;
export const WorkspaceInsert = workspaceModel.schemaInsert;

// Memberships
const membershipProps = {
  workspaceId: "workspaceId",
  userId: "userId",
  role: "role",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
} as const;

const fromMembership = createFromDataModel(membershipProps);

const membershipModel = fromMembership(
  ({ workspaceId, userId, role, createdAt, updatedAt }) => {
    // sql
    const table = pgTable("workspace_membership", {
      [workspaceId]: uuid("workspace_id")
        .notNull()
        .references(() => workspaceTable.id, { onDelete: "cascade" }),
      [userId]: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
      [role]: text("role").notNull().default("member"),
      [createdAt]: timestamp("created_at").defaultNow().notNull(),
      [updatedAt]: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    });

    // select
    const schema = Schema.Struct({
      [workspaceId]: Schema.UUID,
      [userId]: Schema.String,
      [role]: Schema.String,
      [createdAt]: Schema.DateFromSelf,
      [updatedAt]: Schema.DateFromSelf,
    });

    // insert
    const schemaInsert = Schema.Struct({
      ...schema.fields,
    });

    return { table, schema, schemaInsert };
  },
);

export const workspaceMembershipTable = membershipModel.table;
export type WorkspaceMembership = DrizzleModelTypes<
  typeof workspaceMembershipTable
>["Select"];
export type WorkspaceMembershipInsert = DrizzleModelTypes<
  typeof workspaceMembershipTable
>["Insert"];
export const WorkspaceMembership = membershipModel.schema;
export const WorkspaceMembershipInsert = membershipModel.schemaInsert;

// Summary DTO for API responses
export const WorkspaceSummary = Schema.Struct({
  id: Schema.UUID,
  slug: Schema.String,
  name: Schema.String,
  role: Schema.String,
});
export type WorkspaceSummary = Schema.Schema.Type<typeof WorkspaceSummary>;
