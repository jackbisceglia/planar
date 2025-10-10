import { Config, Effect } from "effect";

export const ApiConfig = Config.all({
  port: Config.number("VITE_API_PORT").pipe(Config.withDefault(undefined)),
  url: Config.string("VITE_API_URL"),
});

/**
 * Returns the API URL with optional port appended.
 *
 * Use cases:
 * - Development: Returns `http://0.0.0.0:<port>` when VITE_API_PORT is set
 * - Production: Returns `https://domain/api` when VITE_API_PORT is not set
 *
 * This ensures both the API and web app use the same URL configuration
 * derived from environment variables.
 */
export const getApiUrl = Effect.fn("getApiUrl")(function* () {
  const config = yield* ApiConfig;

  if (!config.port) return config.url;

  return `${config.url}:${config.port.toString()}`;
});
