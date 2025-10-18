import { Config, Layer, pipe } from "effect";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as schema from "./schema";
import { PgClient } from "@effect/sql-pg";
import { DatabaseConfig } from "../config/db";

// database requirement for drizzle w/ schema type inference
export const Database = PgDrizzle.make<typeof schema>({ schema });

export function getDatabaseUrl() {
  return pipe(
    DatabaseConfig,
    Config.map(
      (config) =>
        `postgresql://${config.user}:${config.password}@${config.host}:${config.port.toString()}/${config.database}`,
    ),
    (url) => Config.redacted(url),
  );
}

const PgLive = PgClient.layerConfig({
  url: getDatabaseUrl(),
  prepare: Config.succeed(false),
}).pipe(Layer.orDie);

const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));

export const DatabaseLive = Layer.mergeAll(PgLive, DrizzleLive);
