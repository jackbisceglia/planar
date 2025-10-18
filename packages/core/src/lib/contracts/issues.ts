import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { Issue, IssueInsert } from "../drizzle/schema";

export const IssuesGroup = HttpApiGroup.make("issues")
  .add(
    HttpApiEndpoint.get("get")`/`
      .setPayload(Schema.Struct({ id: Schema.String }))
      .addError(HttpApiError.NotFound)
      .addSuccess(Schema.Union(Issue, Schema.Null)),
  )
  .add(
    HttpApiEndpoint.get("getAll")`/all`
      .addError(HttpApiError.NotFound)
      .addSuccess(Schema.Array(Issue)),
  )
  .add(
    HttpApiEndpoint.post("create")`/`
      .setPayload(IssueInsert)
      .addError(HttpApiError.BadRequest)
      .addSuccess(Schema.String),
  )
  .prefix("/issues");
