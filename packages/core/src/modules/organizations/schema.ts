import { pgTable, text, uuid, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { issueTable } from "../issues/schema";
import {
  createFromDataModel,
  DrizzleModelTypes,
} from "../../lib/drizzle/utils";
import { Schema } from "effect";

// Enums
export const membershipRoleEnum = pgEnum("membership_role", [
  "owner",
  "admin", 
  "member",
  "guest"
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted", 
  "declined",
  "expired"
]);

// Organization table
const organizationProperties = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  avatarUrl: "avatar_url",
  isPersonal: "is_personal",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;

const fromOrganizations = createFromDataModel(organizationProperties);

const organizationModel = fromOrganizations(({ 
  id, 
  name, 
  slug, 
  description, 
  avatarUrl, 
  isPersonal,
  createdAt,
  updatedAt 
}) => {
  // sql
  const table = pgTable("organization", {
    [id]: uuid()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    [name]: text().notNull(),
    [slug]: text().notNull().unique(),
    [description]: text(),
    [avatarUrl]: text(),
    [isPersonal]: boolean().default(false).notNull(),
    [createdAt]: timestamp().defaultNow().notNull(),
    [updatedAt]: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

  // select
  const schema = Schema.Struct({
    [id]: Schema.UUID,
    [name]: Schema.String,
    [slug]: Schema.String,
    [description]: Schema.optional(Schema.String),
    [avatarUrl]: Schema.optional(Schema.String),
    [isPersonal]: Schema.Boolean,
    [createdAt]: Schema.Date,
    [updatedAt]: Schema.Date,
  });

  // insert
  const schemaInsert = Schema.Struct({
    ...schema.fields,
    [id]: schema.fields[id].pipe(Schema.optional),
    [createdAt]: schema.fields[createdAt].pipe(Schema.optional),
    [updatedAt]: schema.fields[updatedAt].pipe(Schema.optional),
  });

  return { table, schema, schemaInsert };
});

export const organizationTable = organizationModel.table;

// Workspace table
const workspaceProperties = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  organizationId: "organization_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;

const fromWorkspaces = createFromDataModel(workspaceProperties);

const workspaceModel = fromWorkspaces(({ 
  id, 
  name, 
  slug, 
  description, 
  organizationId,
  createdAt,
  updatedAt 
}) => {
  // sql
  const table = pgTable("workspace", {
    [id]: uuid()
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    [name]: text().notNull(),
    [slug]: text().notNull(),
    [description]: text(),
    [organizationId]: uuid()
      .notNull()
      .references(() => organizationTable.id, { onDelete: "cascade" }),
    [createdAt]: timestamp().defaultNow().notNull(),
    [updatedAt]: timestamp()
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

  // select
  const schema = Schema.Struct({
    [id]: Schema.UUID,
    [name]: Schema.String,
    [slug]: Schema.String,
    [description]: Schema.optional(Schema.String),
    [organizationId]: Schema.UUID,
    [createdAt]: Schema.Date,
    [updatedAt]: Schema.Date,
  });

  // insert
  const schemaInsert = Schema.Struct({
    ...schema.fields,
    [id]: schema.fields[id].pipe(Schema.optional),
    [createdAt]: schema.fields[createdAt].pipe(Schema.optional),
    [updatedAt]: schema.fields[updatedAt].pipe(Schema.optional),
  });

  return { table, schema, schemaInsert };
});

export const workspaceTable = workspaceModel.table;

// Organization membership table
export const organizationMembershipTable = pgTable("organization_membership", {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  role: membershipRoleEnum().default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Workspace membership table
export const workspaceMembershipTable = pgTable("workspace_membership", {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaceTable.id, { onDelete: "cascade" }),
  role: membershipRoleEnum().default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Invitation table
export const invitationTable = pgTable("invitation", {
  id: uuid()
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: text().notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .references(() => workspaceTable.id, { onDelete: "cascade" }),
  invitedById: text("invited_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: membershipRoleEnum().default("member").notNull(),
  status: invitationStatusEnum().default("pending").notNull(),
  token: text().notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const organizationRelations = relations(organizationTable, ({ many }) => ({
  memberships: many(organizationMembershipTable),
  workspaces: many(workspaceTable),
  invitations: many(invitationTable),
}));

export const workspaceRelations = relations(workspaceTable, ({ one, many }) => ({
  organization: one(organizationTable, {
    fields: [workspaceTable.organization_id],
    references: [organizationTable.id],
  }),
  memberships: many(workspaceMembershipTable),
  issues: many(issueTable),
  invitations: many(invitationTable),
}));

export const issueRelations = relations(issueTable, ({ one }) => ({
  workspace: one(workspaceTable, {
    fields: [issueTable.workspace_id],
    references: [workspaceTable.id],
  }),
}));

export const organizationMembershipRelations = relations(
  organizationMembershipTable,
  ({ one }) => ({
    user: one(user, {
      fields: [organizationMembershipTable.userId],
      references: [user.id],
    }),
    organization: one(organizationTable, {
      fields: [organizationMembershipTable.organizationId],
      references: [organizationTable.id],
    }),
  })
);

export const workspaceMembershipRelations = relations(
  workspaceMembershipTable,
  ({ one }) => ({
    user: one(user, {
      fields: [workspaceMembershipTable.userId],
      references: [user.id],
    }),
    workspace: one(workspaceTable, {
      fields: [workspaceMembershipTable.workspaceId],
      references: [workspaceTable.id],
    }),
  })
);

export const invitationRelations = relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id],
  }),
  workspace: one(workspaceTable, {
    fields: [invitationTable.workspaceId],
    references: [workspaceTable.id],
  }),
  invitedBy: one(user, {
    fields: [invitationTable.invitedById],
    references: [user.id],
  }),
}));

// Types
type OrganizationTypes = DrizzleModelTypes<typeof organizationTable>;
type WorkspaceTypes = DrizzleModelTypes<typeof workspaceTable>;

export type Organization = OrganizationTypes["Select"];
export type OrganizationInsert = OrganizationTypes["Insert"];
export type Workspace = WorkspaceTypes["Select"];
export type WorkspaceInsert = WorkspaceTypes["Insert"];

export type OrganizationMembership = typeof organizationMembershipTable.$inferSelect;
export type OrganizationMembershipInsert = typeof organizationMembershipTable.$inferInsert;
export type WorkspaceMembership = typeof workspaceMembershipTable.$inferSelect;
export type WorkspaceMembershipInsert = typeof workspaceMembershipTable.$inferInsert;
export type Invitation = typeof invitationTable.$inferSelect;
export type InvitationInsert = typeof invitationTable.$inferInsert;

// Schemas
export const Organization = organizationModel.schema;
export const OrganizationInsert = organizationModel.schemaInsert;
export const Workspace = workspaceModel.schema;
export const WorkspaceInsert = workspaceModel.schemaInsert;

export const OrganizationMembership = Schema.Struct({
  id: Schema.UUID,
  userId: Schema.String,
  organizationId: Schema.UUID,
  role: Schema.Literal("owner", "admin", "member", "guest"),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});

export const WorkspaceMembership = Schema.Struct({
  id: Schema.UUID,
  userId: Schema.String,
  workspaceId: Schema.UUID,
  role: Schema.Literal("owner", "admin", "member", "guest"),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});

export const Invitation = Schema.Struct({
  id: Schema.UUID,
  email: Schema.String,
  organizationId: Schema.UUID,
  workspaceId: Schema.optional(Schema.UUID),
  invitedById: Schema.String,
  role: Schema.Literal("owner", "admin", "member", "guest"),
  status: Schema.Literal("pending", "accepted", "declined", "expired"),
  token: Schema.String,
  expiresAt: Schema.Date,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});