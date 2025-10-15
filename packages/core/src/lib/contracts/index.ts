import { HttpApi, HttpApiError } from "@effect/platform";
import { UsersGroup } from "./user";

export const Api = HttpApi.make("Api")
  .add(UsersGroup)
  .addError(HttpApiError.InternalServerError);
