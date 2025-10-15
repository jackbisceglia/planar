import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@planar/core/lib/contracts/index";
import { Effect, Layer } from "effect";
import { toInternalServerError } from "./errors";
import { Issues } from "@planar/core/modules/issues/entity";

const IssuesGroupHandlers = HttpApiBuilder.group(
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
      .handle("create", (input) =>
        entity
          .create({ ...input.payload })
          .pipe(Effect.map((result) => result.id))
          .pipe(Effect.catchTags({ SqlError: toInternalServerError })),
      );
  }),
);

export const IssuesGroupLive = IssuesGroupHandlers.pipe(
  Layer.provide(Issues.Default),
);
