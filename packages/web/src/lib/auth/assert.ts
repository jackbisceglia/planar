import { redirect } from "@tanstack/solid-router";
import { auth } from "./better-auth-client";
import { TaggedError } from "@planar/core/lib/effect/error";
import { Exit } from "effect";
import { AuthClientResult } from "./hooks";

class InvalidWorkspaceError extends TaggedError("InvalidWorkspaceError") {}

type GetSessionResponse = AuthClientResult<
  (typeof auth.$Infer)["Session"],
  unknown
>;

type GetSessionOk = NonNullable<GetSessionResponse["data"]>;
type GetSessionFail = GetSessionResponse["error"];

type AuthenticatedUser = NonNullable<GetSessionOk>;

/**
 * Asserts that a user is authenticated by checking an Exit result from a session request.
 *
 * This function takes an Exit type (which represents either success or failure) and:
 * - If the result is a failure or the data is null/undefined, redirects to the home page
 * - If successful and data exists, asserts to the type system that the result is a Success
 *   containing authenticated user data, allowing consumers to safely access result.value
 *
 * @param result - Exit result from session authentication, can be Success with user data or null, or Failure
 * @throws Redirects to "/" if authentication fails or no user data present
 * @returns Type assertion that result is Exit.Success<GetSessionOk, AuthenticatedUser>
 */
export function assertUserIsAuthenticated(
  result: Exit.Exit<GetSessionOk | null, GetSessionFail>,
): asserts result is Exit.Success<GetSessionOk, AuthenticatedUser> {
  const data = Exit.getOrElse(result, () => null);

  if (Exit.isFailure(result) || !data) {
    // TODO: Add branched error handling for different failure types
    redirect({ throw: true, to: "/" });
  }
}

// TODO: update to pull from persisted user workspace list
export function assertUserCanAccessWorkspace(
  _data: GetSessionOk,
  workspaceMatch: string,
) {
  const temp = "planar";

  if (temp !== workspaceMatch) {
    throw new InvalidWorkspaceError("This workspace does not exist");
  }
}
