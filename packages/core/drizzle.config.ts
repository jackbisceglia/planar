import { defineConfig } from "drizzle-kit";
import { Schema } from "effect";

const parse = Schema.String.pipe(Schema.decodeUnknownSync);

const url = parse(process.env.DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "src/modules/**/schema.ts",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
