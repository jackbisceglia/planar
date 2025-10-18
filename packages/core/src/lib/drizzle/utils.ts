import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { Schema } from "effect";

export type DrizzleModelTypes<Model extends PgTable> = {
  Select: InferSelectModel<Model>;
  Insert: InferInsertModel<Model>;
};

/**
 * Temporary helper to ensure consistent property names across Drizzle schema and Effect schema
 * by forcing the developer to reference the same property keys for both.
 *
 * Usage: Define property keys once, then reference them in the callback to build both
 * Drizzle table definition and Effect schemas, ensuring they stay in sync.
 *
 * This is a workaround until an official drizzle-orm => @effect/schema package exists.
 * The callback receives the property map and must use all properties to define table + schemas.
 *
 * @param properties - Object mapping property names to their string keys
 * @returns A function that accepts a callback to build schemas using the provided property keys
 */
export function createFromDataModel<TProps extends object>(properties: TProps) {
  type Targets<
    TTable extends PgTable,
    TSchema extends Schema.Any,
    TSchemaInsert extends Schema.Any,
  > = {
    table: TTable;
    schema: TSchema;
    schemaInsert: TSchemaInsert;
  };

  function use<
    TTable extends PgTable,
    TSchema extends Schema.Any,
    TSchemaInsert extends Schema.Any,
  >(fn: (props: TProps) => Targets<TTable, TSchema, TSchemaInsert>) {
    return fn(properties);
  }

  return use;
}
