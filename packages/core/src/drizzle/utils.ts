import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

export type DrizzleModelTypes<Model extends PgTable> = {
  Select: InferSelectModel<Model>;
  Insert: InferInsertModel<Model>;
};
