import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { createServer } from "node:http";
import { IssuesGroupLive } from "./routes.issues";
import { Api } from "@planar/core/lib/contracts/index";
import { RuntimeServer } from "./server.runtime";
import { ApiConfig } from "@planar/core/lib/config/api";
import { AuthGroupLive } from "./routes.auth";

// construct the effect api implementation
const ApiLive = HttpApiBuilder.api(Api)
  .pipe(Layer.provide(IssuesGroupLive))
  .pipe(Layer.provide(AuthGroupLive));

// construct node http server
const NodeHttpLive = NodeHttpServer.layerConfig(createServer, {
  port: ApiConfig.pipe(Config.map((config) => config.port)),
});

// build program
const Program = HttpApiBuilder.serve()
  .pipe(Layer.provide(ApiLive))
  .pipe(
    Layer.provide(
      HttpApiBuilder.middlewareCors({
        allowedOrigins: ["http://localhost:3000"],
        allowedMethods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      }),
    ),
  )
  .pipe(HttpServer.withLogAddress)
  .pipe(Layer.provide(NodeHttpLive))
  .pipe(Layer.launch);

await RuntimeServer.runPromise(Program).then(RuntimeServer.dispose);
