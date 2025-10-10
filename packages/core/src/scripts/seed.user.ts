import { Effect } from "effect";
import { DotEnvConfigProviderLayer } from "../lib/effect/env.server";
import { Users } from "../modules/users/entity";
import { UserInsert } from "../modules/users/schema";

const mocks = [
  {
    email: "johndoe@gmail.com",
    image: "https://google.com",
    name: "John Doe",
  },
  {
    email: "janedoe@gmail.com",
    image: "https://google.com",
    name: "Jane Doe",
  },
  {
    email: "foobar@gmail.com",
    image: "https://google.com",
    name: "Foo Bar",
  },
] satisfies UserInsert[];

const setup = Effect.fn(function* () {
  const entity = yield* Users;

  yield* entity.removeAll();
});

const run = Effect.fn("user.seed")(
  function* (users: UserInsert[]) {
    const entity = yield* Users;

    yield* setup();

    const results = yield* Effect.forEach(users, (user) => entity.create(user));

    return results;
  },
  Effect.provide(Users.Default),
  Effect.provide(DotEnvConfigProviderLayer),
);

void Effect.runPromise(run(mocks));
