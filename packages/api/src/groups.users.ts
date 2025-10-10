import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@planar/core/contracts/index";
import { Effect, Layer } from "effect";
import { toInternalServerError } from "./errors";
import { Users } from "@planar/core/modules/users/entity";

const UsersGroupHandlers = HttpApiBuilder.group(
  Api,
  "users",
  Effect.fn(function* (handlers) {
    const entity = yield* Users;

    return handlers
      .handle("get", (input) =>
        entity.get(input.payload.id).pipe(
          Effect.catchTags({
            SqlError: toInternalServerError,
            UserNotFoundError: () => Effect.succeed(null),
          }),
        ),
      )
      .handle("create", (input) =>
        entity
          .create({ ...input.payload, image: "https://google.com" })
          .pipe(Effect.map((result) => result.id))
          .pipe(Effect.catchTags({ SqlError: toInternalServerError })),
      );
  }),
);

export const UsersGroupLive = UsersGroupHandlers.pipe(
  Layer.provide(Users.Default),
);
