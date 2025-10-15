import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@planar/core/lib/contracts/index";
import { Effect } from "effect";
import { toInternalServerError } from "./errors";
import { Issues } from "@planar/core/modules/issues/entity";

export const IssuesGroupLive = HttpApiBuilder.group(
  Api,
  "issues",
  Effect.fn(function* (handlers) {
    const entity = yield* Issues;

    return handlers
      .handle("get", (input) =>
        entity.get(input.payload.id).pipe(
          Effect.catchTags({
            SqlError: toInternalServerError,
            IssueNotFoundError: () => Effect.succeed(null),
          }),
        ),
      )
      .handle("getAll", () =>
        entity
          .getAll()
          .pipe(Effect.catchTags({ SqlError: toInternalServerError })),
      )
      .handle("create", (input) =>
        entity
          .create({ ...input.payload })
          .pipe(Effect.map((result) => result.id))
          .pipe(Effect.catchTags({ SqlError: toInternalServerError })),
      );
  }),
);
