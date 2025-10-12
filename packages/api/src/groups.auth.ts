import { HttpApiBuilder, HttpServerResponse } from "@effect/platform";
import { Api } from "@planar/core/contracts/index";
import { Layer, pipe } from "effect";
import { Users } from "@planar/core/modules/users/entity";
import { auth } from "@planar/core/lib/auth/index";

const AuthGroupHandlers = HttpApiBuilder.group(
  Api,
  "auth",
  function (handlers) {
    return handlers
      .handle("get", (input) =>
        pipe(
          input.request.source as Request,
          auth.handler,
          HttpServerResponse.raw,
        ),
      )
      .handle("post", (input) =>
        pipe(
          input.request.source as Request,
          auth.handler,
          HttpServerResponse.raw,
        ),
      );
  },
);

export const AuthGroupLive = AuthGroupHandlers.pipe(
  Layer.provide(Users.Default),
);
