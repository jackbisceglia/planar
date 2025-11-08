import { TaggedError } from "@planar/core/lib/effect/error";
import { Cause, Exit, pipe } from "effect";
import { requireValueNonNullishExit } from "@planar/core/lib/effect/index";
import { safeThrowRedirect } from "../navigation";
import { AuthClient } from "@planar/core/lib/auth/client";
import { RuntimeClient } from "../setup/client-runtime";
import { AsyncReturn } from "@planar/core/lib/utils/index";

export type BetterAuthResult<T, R> =
  | { data: T; error: null }
  | { data: null; error: R };

export type WithAuthClientExit<TAuthType, R> = AsyncReturn<
  typeof withAuthClient<TAuthType, R>
>;

// errors
class UnauthorizedUserError extends TaggedError("UnauthorizedUserError") {}

// client
export type AuthClient = typeof auth.$Infer;
export const auth = await RuntimeClient.runPromise(AuthClient);

type SessionResponse = AuthClient["Session"] | null;
type AuthenticationExit<R> = WithAuthClientExit<SessionResponse, R>;

/**
 * Type guard to narrow BetterAuthResult to success case
 */

/**
 * Converts an AuthClientResult to an Exit type
 * @template T - The success type of the auth client result
 * @template E - The error type of the auth client result
 * @param {AuthClientResult<T, E>} res - The auth client result to convert
 * @returns {Exit.Exit<T, NonNullable<E>>} An Exit containing either success data or failure cause
 */
function authClientResultToExit<T, E>(
  res: BetterAuthResult<T, E>,
): Exit.Exit<T, NonNullable<E>> {
  // force TS to narrow on success case
  function internalSuccessGuard<TSuccess, TError>(
    res: BetterAuthResult<TSuccess, TError>,
  ): res is { data: TSuccess; error: null } {
    return res.error === null;
  }

  if (internalSuccessGuard(res)) {
    return Exit.succeed(res.data);
  } else {
    return Exit.failCause(Cause.fail(res.error as NonNullable<E>));
  }
}

/**
 * Access auth client and return a mapped exit
 * @template T - The success type of the auth client result
 * @template R - The error type of the auth client result
 * @param {(client: typeof auth) => Promise<AuthClientResult<T, R>>} fn - Function that takes the auth client and returns a promise of AuthClientResult
 * @returns {Promise<Exit.Exit<T, NonNullable<R>>>} A promise that resolves to an Exit containing either success data or failure cause
 */
export async function withAuthClient<T, R>(
  fn: (client: typeof auth) => Promise<BetterAuthResult<T, R>>,
) {
  return authClientResultToExit(await fn(auth));
}

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
 */
export function assertUserIsAuthenticated<R>(
  authenticationResult: AuthenticationExit<R>,
): asserts authenticationResult is Exit.Success<
  NonNullable<SessionResponse>,
  never
> {
  pipe(
    authenticationResult,
    Exit.flatMap((data) =>
      requireValueNonNullishExit(
        new UnauthorizedUserError("User is not authenticated"),
      )(data),
    ),
    Exit.match({
      onSuccess: (data) => data,
      onFailure: () => {
        safeThrowRedirect({ to: "/", throw: true }, "authentication");
      },
    }),
  );
}
