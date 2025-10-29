import { Effect } from "effect";
import { Database, DatabaseLive } from "../../lib/drizzle/";
import { SqlError } from "@effect/sql";
import { TaggedError } from "../../lib/effect/error";
import { IssueInsert, issueTable } from "./schema";
import { eq } from "drizzle-orm";

class IssueNotCreatedError extends TaggedError("IssueNotCreatedError") {}
class IssueNotFoundError extends TaggedError("IssueNotFoundError") {}

export class Issues extends Effect.Service<Issues>()("Issues", {
  dependencies: [DatabaseLive],

  effect: Effect.gen(function* () {
    const database = yield* Database;

    return {
      get: Effect.fn("issue.get")(function* get(id: string) {
        const row = yield* database.query.issueTable.findFirst({
          where: (table, cmp) => cmp.eq(table.id, id),
        });

        if (!row) return yield* new IssueNotFoundError("Could not find issue");

        return row;
      }),
      getAll: Effect.fn("issue.getAll")(function* getAll() {
        const rows = yield* database.query.issueTable.findMany();

        return rows;
      }),
      getAllByWorkspace: Effect.fn("issue.getAllByWorkspace")(function* getAllByWorkspace(workspaceId: string) {
        const rows = yield* database.query.issueTable.findMany({
          where: (table, cmp) => cmp.eq(table.workspace_id, workspaceId),
        });

        return rows;
      }),
      create: Effect.fn("issue.create")(function* create(issue: IssueInsert) {
        const [row] = yield* database
          .insert(issueTable)
          .values(issue)
          .returning();

        if (!row) {
          const cause = new IssueNotCreatedError("could not create issue");

          return yield* new SqlError.SqlError({ cause });
        }

        return row;
      }),
      update: Effect.fn("issue.update")(function* update(id: string, updates: Partial<IssueInsert>) {
        const [row] = yield* database
          .update(issueTable)
          .set(updates)
          .where(eq(issueTable.id, id))
          .returning();

        if (!row) return yield* new IssueNotFoundError("Could not find issue to update");

        return row;
      }),
      delete: Effect.fn("issue.delete")(function* deleteIssue(id: string) {
        const [row] = yield* database
          .delete(issueTable)
          .where(eq(issueTable.id, id))
          .returning({ id: issueTable.id });

        if (!row) return yield* new IssueNotFoundError("Could not find issue to delete");

        return row;
      }),
      createMany: Effect.fn("issue.createMany")(function* createMany(
        issues: IssueInsert[],
      ) {
        const rows = yield* database
          .insert(issueTable)
          .values(issues)
          .returning({
            id: issueTable.id,
          });

        return rows;
      }),
      removeAll: Effect.fn("issue.removeAll")(function* removeAll() {
        const rows = yield* database
          .delete(issueTable)
          .returning({ id: issueTable.id });

        return rows;
      }),
    };
  }),
}) {}
