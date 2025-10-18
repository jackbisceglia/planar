import { HttpApi, HttpApiError } from "@effect/platform";
import { IssuesGroup } from "./issues";
import { AuthGroup } from "./auth";

export const Api = HttpApi.make("Api")
  .add(IssuesGroup)
  .add(AuthGroup)
  .addError(HttpApiError.InternalServerError)
  .prefix("/api");
