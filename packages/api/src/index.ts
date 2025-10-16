import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Config, Effect, Layer } from "effect";
import { createServer } from "node:http";
import { IssuesGroupLive } from "./routes.issues";
import { Api } from "@planar/core/lib/contracts/index";
import { RuntimeServer } from "./server-runtime";
import { ApiConfig } from "@planar/core/lib/config/api";
import { AuthGroupLive } from "./routes.auth";
import { WebUrl } from "@planar/core/lib/config/web";

// construct the effect api implementation
const ApiLive = HttpApiBuilder.api(Api)
  .pipe(Layer.provide(IssuesGroupLive))
  .pipe(Layer.provide(AuthGroupLive));

// construct node http server
const NodeHttpLive = NodeHttpServer.layerConfig(createServer, {
  port: ApiConfig.pipe(Config.map((config) => config.port)),
});

const CorsMiddlewareLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const url = yield* WebUrl;

    return HttpApiBuilder.middlewareCors({
      allowedOrigins: [url],
      allowedMethods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    });
  }),
);

// build program
const Program = HttpApiBuilder.serve()
  .pipe(Layer.provide(ApiLive))
  .pipe(Layer.provide(CorsMiddlewareLayer))
  .pipe(HttpServer.withLogAddress)
  .pipe(Layer.provide(NodeHttpLive))
  .pipe(Layer.launch);

await RuntimeServer.runPromise(Program).then(RuntimeServer.dispose);
