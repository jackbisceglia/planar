import { Effect } from "effect";
import { Database, DatabaseLive } from "../../lib/drizzle";
import { SqlError } from "@effect/sql";
import { TaggedError } from "../../lib/effect/error";
import {
  workspaceMembershipTable,
  workspaceTable,
  WorkspaceSummary as WorkspaceSummarySchema,
} from "./schema";
import { eq } from "drizzle-orm";

class WorkspaceNotFoundError extends TaggedError("WorkspaceNotFoundError") {}

export type UserWorkspace = WorkspaceSummarySchema;

export class Workspaces extends Effect.Service<Workspaces>()("Workspaces", {
  dependencies: [DatabaseLive],

  effect: Effect.gen(function* () {
    const database = yield* Database;

    return {
      /**
       * List workspaces the user is a member of
       */
      listForUser: Effect.fn("workspace.listForUser")(function* listForUser(
        userId: string,
      ) {
        try {
          const rows = yield* database
            .select({
              id: workspaceTable.id,
              slug: workspaceTable.slug,
              name: workspaceTable.name,
              role: workspaceMembershipTable.role,
            })
            .from(workspaceTable)
            .innerJoin(
              workspaceMembershipTable,
              eq(workspaceMembershipTable.workspaceId, workspaceTable.id),
            )
            .where(eq(workspaceMembershipTable.userId, userId));

          // validate using schema to ensure shape
          const parsed = yield* Effect.try({
            try: () => WorkspaceSummarySchema.decode(rows),
            catch: (cause) => cause as Error,
          });

          return parsed;
        } catch (cause) {
          return yield* new SqlError.SqlError({ cause });
        }
      }),

      /**
       * Resolve a workspace by slug ensuring membership
       */
      resolveForUserBySlug: Effect.fn("workspace.resolveForUserBySlug")(
        function* resolveForUserBySlug(userId: string, slug: string) {
          const rows = yield* database
            .select({
              id: workspaceTable.id,
              slug: workspaceTable.slug,
              name: workspaceTable.name,
              role: workspaceMembershipTable.role,
            })
            .from(workspaceTable)
            .innerJoin(
              workspaceMembershipTable,
              eq(workspaceMembershipTable.workspaceId, workspaceTable.id),
            )
            .where(eq(workspaceTable.slug, slug))
            .where(eq(workspaceMembershipTable.userId, userId));

          const [row] = rows;

          if (!row) return yield* new WorkspaceNotFoundError("Not found");

          return row;
        },
      ),
    };
  }),
}) {}
