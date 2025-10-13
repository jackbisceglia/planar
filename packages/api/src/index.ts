import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { createServer } from "node:http";
import { UsersGroupLive } from "./groups.users";
import { Api } from "@planar/core/contracts/index";
import { DotEnvConfigProviderLayer } from "@planar/core/lib/effect/env.server";
import { ApiConfig } from "@planar/core/contracts/config";
import { AuthGroupLive } from "./groups.auth";

const ApiLive = HttpApiBuilder.api(Api)
  .pipe(Layer.provide(UsersGroupLive))
  .pipe(Layer.provide(AuthGroupLive));

const NodeHttpLive = NodeHttpServer.layerConfig(createServer, {
  port: ApiConfig.pipe(Config.map((config) => config.port)),
});

const HttpLive = HttpApiBuilder.serve()
  .pipe(Layer.provide(ApiLive))
  .pipe(Layer.provide(HttpApiBuilder.middlewareCors()))
  .pipe(HttpServer.withLogAddress)
  .pipe(Layer.provide(NodeHttpLive));

NodeRuntime.runMain(
  HttpLive.pipe(Layer.provide(DotEnvConfigProviderLayer)).pipe(Layer.launch),
);
