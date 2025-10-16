import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "@planar/core/lib/contracts/index";
import { HttpServerRequest } from "@effect/platform/HttpServerRequest";
import { Auth } from "@planar/core/lib/auth/server";
import { NodeHttpServerRequest } from "@effect/platform-node";
import { toNodeHandler } from "better-auth/node";
import { APIError } from "better-auth";
import { WebUrl } from "@planar/core/lib/config/web";

type Input = { readonly request: HttpServerRequest };

const handler = Effect.fn("betterAuth.handler")(function* (input: Input) {
  const webUrl = yield* WebUrl;
  const auth = yield* Auth;

  const request = NodeHttpServerRequest.toIncomingMessage(input.request);
  const response = NodeHttpServerRequest.toServerResponse(input.request);

  // TODO: fix to be contextual on env
  response.setHeader("Access-Control-Allow-Origin", webUrl);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", "true");

  const handle = () => toNodeHandler(auth)(request, response);

  return yield* Effect.tryPromise({
    try: handle,
    catch: (error) => {
      if (error instanceof APIError) {
        return new HttpApiError.Unauthorized();
      }

      return new HttpApiError.InternalServerError();
    },
  });
});

export const AuthGroupLive = HttpApiBuilder.group(Api, "auth", (handlers) => {
  return handlers.handle("get", handler).handle("post", handler);
});
