import { Effect } from "effect";
import { SqlError } from "@effect/sql";
import { Database } from "../../lib/drizzle";
import { 
  organizationTable,
  workspaceTable,
  organizationMembershipTable,
  workspaceMembershipTable,
  invitationTable,
  OrganizationInsert,
  WorkspaceInsert,
} from "./schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Organization Service
export class OrganizationService extends Effect.Service<OrganizationService>()("OrganizationService", {
  effect: Effect.gen(function* () {
    const db = yield* Database;

    const getUserOrganizations = (userId: string) =>
      Effect.gen(function* () {
        const orgsWithMemberships = yield* Effect.tryPromise({
          try: () => db
            .select({
              id: organizationTable.id,
              name: organizationTable.name,
              slug: organizationTable.slug,
              description: organizationTable.description,
              avatarUrl: organizationTable.avatar_url,
              isPersonal: organizationTable.is_personal,
              createdAt: organizationTable.created_at,
              updatedAt: organizationTable.updated_at,
              role: organizationMembershipTable.role,
            })
            .from(organizationTable)
            .innerJoin(
              organizationMembershipTable,
              eq(organizationTable.id, organizationMembershipTable.organizationId)
            )
            .where(eq(organizationMembershipTable.userId, userId))
            .orderBy(desc(organizationTable.created_at)),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        // Get workspaces for each organization
        const orgsWithWorkspaces = yield* Effect.forEach(
          orgsWithMemberships,
          (org) =>
            Effect.gen(function* () {
              const workspaces = yield* Effect.tryPromise({
                try: () => db
                  .select({
                    id: workspaceTable.id,
                    name: workspaceTable.name,
                    slug: workspaceTable.slug,
                    description: workspaceTable.description,
                    organizationId: workspaceTable.organization_id,
                    createdAt: workspaceTable.created_at,
                    updatedAt: workspaceTable.updated_at,
                    role: workspaceMembershipTable.role,
                  })
                  .from(workspaceTable)
                  .innerJoin(
                    workspaceMembershipTable,
                    eq(workspaceTable.id, workspaceMembershipTable.workspaceId)
                  )
                  .where(
                    and(
                      eq(workspaceTable.organization_id, org.id),
                      eq(workspaceMembershipTable.userId, userId)
                    )
                  )
                  .orderBy(desc(workspaceTable.created_at)),
                catch: (error) => new SqlError.SqlError({ cause: error }),
              });

              return {
                ...org,
                workspaces,
              };
            }),
          { concurrency: "unbounded" }
        );

        return orgsWithWorkspaces;
      });

    const createOrganization = (data: OrganizationInsert, userId: string) =>
      Effect.gen(function* () {
        const slug = data.slug || generateSlug(data.name);
        
        const [organization] = yield* Effect.tryPromise({
          try: () => db
            .insert(organizationTable)
            .values({ ...data, slug })
            .returning(),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        if (!organization) {
          return yield* Effect.fail(new Error("Failed to create organization"));
        }

        // Add the creator as owner
        yield* Effect.tryPromise({
          try: () => db
            .insert(organizationMembershipTable)
            .values({
              userId,
              organizationId: organization.id,
              role: "owner",
            }),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        // Create default workspace if not personal org
        if (!data.is_personal) {
          const workspaceSlug = generateSlug(`${data.name} General`);
          const [workspace] = yield* Effect.tryPromise({
            try: () => db
              .insert(workspaceTable)
              .values({
                name: "General",
                slug: workspaceSlug,
                organization_id: organization.id,
              })
              .returning(),
            catch: (error) => new SqlError.SqlError({ cause: error }),
          });

          if (workspace) {
            yield* Effect.tryPromise({
              try: () => db
                .insert(workspaceMembershipTable)
                .values({
                  userId,
                  workspaceId: workspace.id,
                  role: "owner",
                }),
              catch: (error) => new SqlError.SqlError({ cause: error }),
            });
          }
        }

        return organization;
      });

    const createWorkspace = (data: WorkspaceInsert, userId: string) =>
      Effect.gen(function* () {
        // Check if user has permission to create workspace in this org
        const membership = yield* Effect.tryPromise({
          try: () => db
            .select()
            .from(organizationMembershipTable)
            .where(
              and(
                eq(organizationMembershipTable.organizationId, data.organization_id),
                eq(organizationMembershipTable.userId, userId)
              )
            )
            .limit(1),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        if (membership.length === 0 || !membership[0] || !["owner", "admin"].includes(membership[0].role)) {
          return yield* Effect.fail(new Error("Insufficient permissions"));
        }

        const slug = data.slug || generateSlug(data.name);
        
        const [workspace] = yield* Effect.tryPromise({
          try: () => db
            .insert(workspaceTable)
            .values({ ...data, slug })
            .returning(),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        if (!workspace) {
          return yield* Effect.fail(new Error("Failed to create workspace"));
        }

        // Add the creator as owner of the workspace
        yield* Effect.tryPromise({
          try: () => db
            .insert(workspaceMembershipTable)
            .values({
              userId,
              workspaceId: workspace.id,
              role: "owner",
            }),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        return workspace;
      });

    const createInvitation = (
      organizationId: string,
      workspaceId: string | null,
      email: string,
      role: "owner" | "admin" | "member" | "guest",
      invitedById: string
    ) =>
      Effect.gen(function* () {
        const token = nanoid(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const [invitation] = yield* Effect.tryPromise({
          try: () => db
            .insert(invitationTable)
            .values({
              email,
              organizationId,
              workspaceId,
              invitedById,
              role,
              token,
              expiresAt,
            })
            .returning(),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        return invitation;
      });

    const acceptInvitation = (token: string, userId: string) =>
      Effect.gen(function* () {
        const [invitation] = yield* Effect.tryPromise({
          try: () => db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.token, token))
            .limit(1),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        if (!invitation) {
          return yield* Effect.fail(new Error("Invitation not found"));
        }

        if (invitation.status !== "pending") {
          return yield* Effect.fail(new Error("Invitation already processed"));
        }

        if (invitation.expiresAt < new Date()) {
          return yield* Effect.fail(new Error("Invitation expired"));
        }

        // Add to organization
        yield* Effect.tryPromise({
          try: () => db
            .insert(organizationMembershipTable)
            .values({
              userId,
              organizationId: invitation.organizationId,
              role: invitation.role,
            })
            .onConflictDoNothing(),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        // Add to workspace if specified
        if (invitation.workspaceId) {
          yield* Effect.tryPromise({
            try: () => db
              .insert(workspaceMembershipTable)
              .values({
                userId,
                workspaceId: invitation.workspaceId!,
                role: invitation.role,
              })
              .onConflictDoNothing(),
            catch: (error) => new SqlError.SqlError({ cause: error }),
          });
        }

        // Mark invitation as accepted
        yield* Effect.tryPromise({
          try: () => db
            .update(invitationTable)
            .set({ status: "accepted" })
            .where(eq(invitationTable.id, invitation.id)),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        return invitation;
      });

    const getUserWorkspaceAccess = (userId: string, workspaceId: string) =>
      Effect.gen(function* () {
        const [membership] = yield* Effect.tryPromise({
          try: () => db
            .select({
              role: workspaceMembershipTable.role,
              workspace: {
                id: workspaceTable.id,
                name: workspaceTable.name,
                slug: workspaceTable.slug,
                organizationId: workspaceTable.organization_id,
              },
            })
            .from(workspaceMembershipTable)
            .innerJoin(
              workspaceTable,
              eq(workspaceMembershipTable.workspaceId, workspaceTable.id)
            )
            .where(
              and(
                eq(workspaceMembershipTable.workspaceId, workspaceId),
                eq(workspaceMembershipTable.userId, userId)
              )
            )
            .limit(1),
          catch: (error) => new SqlError.SqlError({ cause: error }),
        });

        return membership || null;
      });

    return {
      getUserOrganizations,
      createOrganization,
      createWorkspace,
      createInvitation,
      acceptInvitation,
      getUserWorkspaceAccess,
    } as const;
  }),
}) {}

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

// Export the service for dependency injection
export const organizationService = OrganizationService;