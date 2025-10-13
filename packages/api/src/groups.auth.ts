import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { Api } from "@planar/core/contracts/index";
import { Effect, Layer } from "effect";
import { Users } from "@planar/core/modules/users/entity";
import { auth } from "@planar/core/lib/auth/index";
import { toNodeHandler } from "better-auth/node";
import { NodeHttpServerRequest } from "@effect/platform-node";
import { HttpServerRequest } from "@effect/platform/HttpServerRequest";
import { APIError } from "better-auth";

type BetterAuthHandlerInput = { readonly request: HttpServerRequest };

function betterAuthHandler(input: BetterAuthHandlerInput) {
  const handle = () =>
    toNodeHandler(auth)(
      NodeHttpServerRequest.toIncomingMessage(input.request),
      NodeHttpServerRequest.toServerResponse(input.request),
    );

  return Effect.tryPromise({
    try: handle,
    catch: (error) => {
      if (error instanceof APIError) {
        return new HttpApiError.Unauthorized();
      }

      return new HttpApiError.InternalServerError();
    },
  });
}

const AuthGroupHandlers = HttpApiBuilder.group(
  Api,
  "auth",
  function (handlers) {
    return handlers
      .handle("get", betterAuthHandler)
      .handle("post", betterAuthHandler);
  },
);

export const AuthGroupLive = AuthGroupHandlers.pipe(
  Layer.provide(Users.Default),
);
