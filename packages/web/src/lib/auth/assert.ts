import { redirect } from "@tanstack/solid-router";
import { auth } from "./better-auth-client";
import { TaggedError } from "@planar/core/lib/effect/error";
import { NonNullableNested } from "@planar/core/lib/utils/index";
import { defaultWorkspace } from "../../routes/__root";

class InvalidWorkspaceError extends TaggedError("InvalidWorkspaceError") {}

type AuthenticationData = { data: (typeof auth.$Infer)["Session"] | null };

type AuthenticationDataChecked = NonNullableNested<
  AuthenticationData,
  "data",
  "user"
>;

export function assertUserIsAuthenticated(
  auth: AuthenticationData,
): asserts auth is AuthenticationDataChecked {
  const user = auth.data?.user;

  if (!user) {
    redirect({ throw: true, to: "/" });
  }
}

// TODO: update to pull from persisted user workspace list
export function assertWorkspacePathIsValid(
  _auth: AuthenticationData,
  workspaceMatch: string,
) {
  const temp = defaultWorkspace;

  if (temp !== workspaceMatch) {
    throw new InvalidWorkspaceError("This workspace does not exist");
  }
}
