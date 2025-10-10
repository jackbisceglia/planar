import { Effect } from "effect";
import { Database, DatabaseLive } from "../../lib/drizzle/";
import { SqlError } from "@effect/sql";
import { UserInsert, userTable } from "./schema";
import { TaggedError } from "../../lib/effect/error";

class UserNotCreatedError extends TaggedError("UserNotCreatedError") {}
class UserNotFoundError extends TaggedError("UserNotFoundError") {}

export class Users extends Effect.Service<Users>()("Users", {
  dependencies: [DatabaseLive],

  effect: Effect.gen(function* () {
    const database = yield* Database;

    return {
      get: Effect.fn("user.get")(function* get(id: string) {
        const row = yield* database.query.userTable.findFirst({
          where: (table, cmp) => cmp.eq(table.id, id),
        });

        if (!row) return yield* new UserNotFoundError("Could not find user");

        return row.id;
      }),
      create: Effect.fn("user.create")(function* create(user: UserInsert) {
        const [row] = yield* database.insert(userTable).values(user).returning({
          id: userTable.id,
        });

        if (!row) {
          const cause = new UserNotCreatedError("could not create user");

          return yield* new SqlError.SqlError({ cause });
        }

        return row;
      }),
      createMany: Effect.fn("user.createMany")(function* createMany(
        users: UserInsert[],
      ) {
        const rows = yield* database.insert(userTable).values(users).returning({
          id: userTable.id,
        });

        return rows;
      }),
      removeAll: Effect.fn("user.removeAll")(function* removeAll() {
        const rows = yield* database
          .delete(userTable)
          .returning({ id: userTable.id });

        return rows;
      }),
    };
  }),
}) {}
