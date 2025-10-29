import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Config, Effect, Layer } from "effect";
import { createServer } from "node:http";
import { IssuesGroupLive } from "./routes.issues";
import { Api } from "@planar/core/lib/contracts/index";
import { RuntimeServer } from "./server-runtime";
import { ApiConfig } from "@planar/core/lib/config/api";
import { AuthGroupLive } from "./routes.auth";
// TODO: Re-enable organization imports after fixing type issues
// import { 
//   organizationsRoutes, 
//   workspacesRoutes, 
//   membersRoutes, 
//   invitationsRoutes 
// } from "./routes.organizations";
import { WebUrl } from "@planar/core/lib/config/web";
// import { OrganizationService } from "@planar/core/modules/organizations/entity";

// TODO: Re-enable organization service layer
// const OrganizationServiceLive = OrganizationService;

// construct the effect api implementation
const ApiLive = HttpApiBuilder.api(Api)
  .pipe(Layer.provide(IssuesGroupLive))
  .pipe(Layer.provide(AuthGroupLive))
  // TODO: Re-enable organization routes after fixing type issues
  // .pipe(Layer.provide(organizationsRoutes))
  // .pipe(Layer.provide(workspacesRoutes))
  // .pipe(Layer.provide(membersRoutes))
  // .pipe(Layer.provide(invitationsRoutes))
  // .pipe(Layer.provide(OrganizationServiceLive));

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
