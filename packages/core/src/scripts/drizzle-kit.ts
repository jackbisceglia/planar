import { Effect, Redacted } from "effect";
import { getDatabaseUrl } from "../lib/drizzle";
import { execSync } from "child_process";
import { RuntimeCli } from "./cli-runtime";

/*
 NOTE:
 * this is a hack around drizzle-kit not supporting top-level-await
   * in the future we should be able toe move the getDatabaseUrl() logic into the config itself, awaited at the top level.
   * at that point, this can be removed.
*/

function runDrizzleKit(url: string) {
  const args = process.argv.slice(2).join(" ");

  execSync(`drizzle-kit ${args}`, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}

const Program = getDatabaseUrl()
  .pipe(Effect.map((secret) => Redacted.value(secret)))
  .pipe(Effect.tap(runDrizzleKit));

void RuntimeCli.runPromise(Program).then(RuntimeCli.dispose);
