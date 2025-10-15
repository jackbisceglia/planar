import { HttpApi, HttpApiError } from "@effect/platform";
import { IssuesGroup } from "./issues";

export const Api = HttpApi.make("Api")
  .add(IssuesGroup)
  .addError(HttpApiError.InternalServerError);
