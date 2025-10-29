import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { Api } from "@planar/core/lib/contracts/index";
import { Effect } from "effect";
import { Workspaces } from "@planar/core/modules/workspaces/entity";

export const WorkspacesGroupLive = HttpApiBuilder.group(
  Api,
  "workspaces",
  Effect.fn(function* (handlers) {
    const entity = yield* Workspaces;

    return handlers.handle("listMine", (input) => {
      const userId = input.payload.userId;

      if (!userId) {
        return new HttpApiError.Unauthorized();
      }

      return entity.listForUser(userId);
    });
  }),
);
