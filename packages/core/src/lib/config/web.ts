import { Config, Effect } from "effect";
import { buildUrlWithPortOptional } from "../utils";

export const WebConfig = Config.all({
  port: Config.number("VITE_WEB_PORT").pipe(Config.withDefault(undefined)),
  url: Config.string("VITE_WEB_URL"),
});

export const WebUrl = Effect.gen(function* () {
  const config = yield* WebConfig.pipe(Effect.orDie);

  return buildUrlWithPortOptional(config.url, config.port);
});
