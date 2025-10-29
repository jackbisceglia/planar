import { Effect } from "effect";
import { Database, DatabaseLive } from "../../lib/drizzle/";
import { SqlError } from "@effect/sql";
import { TaggedError } from "../../lib/effect/error";
import { IssueInsert, issueTable } from "./schema";
import { eq, and } from "drizzle-orm";

class IssueNotCreatedError extends TaggedError("IssueNotCreatedError") {}
class IssueNotFoundError extends TaggedError("IssueNotFoundError") {}

export class Issues extends Effect.Service<Issues>()("Issues", {
  dependencies: [DatabaseLive],

  effect: Effect.gen(function* () {
    const database = yield* Database;

    return {
      get: Effect.fn("issue.get")(function* get(id: string, organizationId: string) {
        const row = yield* database.query.issueTable.findFirst({
          where: (table, cmp) => 
            and(
              cmp.eq(table.id, id),
              cmp.eq(table.organizationId, organizationId)
            ),
        });

        if (!row) return yield* new IssueNotFoundError("Could not find issue");

        return row;
      }),
      getAll: Effect.fn("issue.getAll")(function* getAll(organizationId: string) {
        const rows = yield* database.query.issueTable.findMany({
          where: (table, cmp) => cmp.eq(table.organizationId, organizationId),
        });

        return rows;
      }),
      create: Effect.fn("issue.create")(function* create(issue: IssueInsert) {
        const [row] = yield* database
          .insert(issueTable)
          .values(issue)
          .returning({
            id: issueTable.id,
          });

        if (!row) {
          const cause = new IssueNotCreatedError("could not create issue");

          return yield* new SqlError.SqlError({ cause });
        }

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
      removeAll: Effect.fn("issue.removeAll")(function* removeAll(organizationId: string) {
        const rows = yield* database
          .delete(issueTable)
          .where(eq(issueTable.organizationId, organizationId))
          .returning({ id: issueTable.id });

        return rows;
      }),
    };
  }),
}) {}
