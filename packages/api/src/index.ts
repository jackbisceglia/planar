import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { createServer } from "node:http";
import { UsersGroupLive } from "./groups.users";
import { Api } from "@planar/core/lib/contracts/index";
import { RuntimeServer } from "./server.runtime";
import { ApiConfig } from "@planar/core/lib/config/api";

// construct the effect api implementation
const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(UsersGroupLive));

// construct node http server
const NodeHttpLive = NodeHttpServer.layerConfig(createServer, {
  port: ApiConfig.pipe(Config.map((config) => config.port)),
});

// build program
const Program = HttpApiBuilder.serve()
  .pipe(Layer.provide(ApiLive))
  .pipe(Layer.provide(HttpApiBuilder.middlewareCors()))
  .pipe(HttpServer.withLogAddress)
  .pipe(Layer.provide(NodeHttpLive))
  .pipe(Layer.launch);

void RuntimeServer.runPromise(Program);
