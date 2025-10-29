import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { Issue } from "../drizzle/schema";

export const IssuesGroup = HttpApiGroup.make("issues")
  .add(
    HttpApiEndpoint.get("get")`/:workspaceId/:issueId`
      .setPath(Schema.Struct({ 
        workspaceId: Schema.UUID,
        issueId: Schema.UUID,
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Union(Issue, Schema.Null)),
  )
  .add(
    HttpApiEndpoint.get("getAll")`/:workspaceId`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Array(Issue)),
  )
  .add(
    HttpApiEndpoint.post("create")`/:workspaceId`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .setPayload(Schema.Struct({
        title: Schema.String,
        description: Schema.String,
      }))
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Issue),
  )
  .add(
    HttpApiEndpoint.patch("update")`/:workspaceId/:issueId`
      .setPath(Schema.Struct({ 
        workspaceId: Schema.UUID,
        issueId: Schema.UUID,
      }))
      .setPayload(Schema.partial(Schema.Struct({
        title: Schema.String,
        description: Schema.String,
      })))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Issue),
  )
  .add(
    HttpApiEndpoint.post("delete")`/:workspaceId/:issueId/delete`
      .setPath(Schema.Struct({ 
        workspaceId: Schema.UUID,
        issueId: Schema.UUID,
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .prefix("/issues");
