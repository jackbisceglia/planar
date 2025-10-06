import { Effect } from "effect";
import { UserInsert, userTable } from "./drizzle/schema";
import { Database } from "./drizzle";
import { TaggedError } from "./effect/error";

class UserNotCreatedError extends TaggedError("UserNotFoundError") {}

// TODO: handle errors
export class Users extends Effect.Service<Users>()("Users", {
  effect: Effect.gen(function* () {
    const database = yield* Database;

    function* get(id: string) {
      const row = yield* database.query.userTable.findFirst({
        where: (table, cmp) => cmp.eq(table.id, id),
      });

      return row?.id;
    }

    function* create(user: UserInsert) {
      const [row] = yield* database.insert(userTable).values(user).returning({
        id: userTable.id,
      });

      if (!row) return yield* new UserNotCreatedError("could not create user");

      return row;
    }

    function* createMany(users: UserInsert[]) {
      const rows = yield* database.insert(userTable).values(users).returning({
        id: userTable.id,
      });

      return rows;
    }

    function* removeAll() {
      const rows = yield* database
        .delete(userTable)
        .returning({ id: userTable.id });

      return rows;
    }

    return {
      get: Effect.fn("user.get")(get),
      create: Effect.fn("user.create")(create),
      createMany: Effect.fn("user.create-many")(createMany),
      removeAll: Effect.fn("user.remove-all")(removeAll),
    };
  }),
}) {}
