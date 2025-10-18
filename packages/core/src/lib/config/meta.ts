import { Config, Effect } from "effect";

export const application = "planar";

export const ApplicationMetaConfig = Config.all({
  stage: Config.string("VITE_STAGE"),
});

/**
 * Combines a string with the application stage, optionally reversing the order.
 * Modify 'stage' via the `VITE_STAGE` environment variable.
 *
 * @param str - The string to combine with the stage
 * @param flip - Optional flag to reverse the order of terms (default: false)
 * @returns A colon-separated string combining the input string and stage
 * @example
 * // Returns "my-service:production" (when stage is "production")
 * const result = yield* withStage("my-service");
 *
 * // Returns "production:my-service" (when stage is "production")
 * const result = yield* withStage("my-service", true);
 */
export const withStage = Effect.fn(function* (str: string, flip?: boolean) {
  const config = yield* ApplicationMetaConfig.pipe(Effect.orDie);

  const terms = [str, config.stage];
  const ordered = flip ? terms.reverse() : terms;

  return ordered.join(":");
});
