import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { WorkspaceSummary } from "../../modules/workspaces/schema";

export const WorkspacesGroup = HttpApiGroup.make("workspaces")
  .add(
    HttpApiEndpoint.post("listMine")`/mine`
      .setPayload(Schema.Struct({ userId: Schema.String }))
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Array(WorkspaceSummary)),
  )
  .prefix("/workspaces");
