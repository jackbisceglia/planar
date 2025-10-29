import { HttpApi, HttpApiError } from "@effect/platform";
import { IssuesGroup } from "./issues";
import { AuthGroup } from "./auth";
import { WorkspacesGroup } from "./workspaces";

export const Api = HttpApi.make("Api")
  .add(IssuesGroup)
  .add(AuthGroup)
  .add(WorkspacesGroup)
  .addError(HttpApiError.InternalServerError)
  .prefix("/api");
