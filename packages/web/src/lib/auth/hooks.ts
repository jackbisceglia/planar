import { getRouteApi, useNavigate } from "@tanstack/solid-router";
import { webBaseUrl } from "../utils";
import { auth } from "./better-auth-client";
import { Cause, Exit } from "effect";

const providers = ["github"] as const;

type Provider = (typeof providers)[number];
type ProviderSignInOptions = Parameters<typeof auth.signIn.social>[0];
type ProviderSignInMap = Record<
  Provider,
  (homeRoute: string) => ProviderSignInOptions
>;

const providerSignInConfiguration = {
  github: (homeRoute: string) => ({
    provider: "github",
    callbackURL: `${webBaseUrl}/${homeRoute}`,
  }),
} as const satisfies ProviderSignInMap;

/**
 * Re-export of auth.useSession for authentication state management
 */
export const useAuthentication = auth.useSession;

/**
 * Re-export of auth.useSession for authentication state management
 */
export const useUser = () =>
  getRouteApi("/_application").useRouteContext({
    select: (s) => s.authentication.user,
  });

/**
 * Re-export of auth.signIn.social wrapped with provider-specific configuration
 */
export const useProviderSignIn = (provider: Provider, homeRoute: string) => {
  if (!providers.includes(provider)) {
    throw new Error(`Provider ${provider} not supported`);
  }

  const getOptions = providerSignInConfiguration[provider];
  const options = getOptions(homeRoute);

  return () => auth.signIn.social(options);
};

export const useSignOut = () => {
  const navigate = useNavigate();

  return async () => {
    await auth.signOut();
    void navigate({ to: "/" });
  };
};

export type AuthClientResult<T, R> =
  | { data: T; error: null }
  | { data: null; error: R };

function authClientResultToExit<T, E>(
  res: AuthClientResult<T, E>,
): Exit.Exit<T, NonNullable<E>> {
  return res.error === null
    ? Exit.succeed(res.data as T)
    : Exit.failCause(Cause.fail(res.error as NonNullable<E>));
}

/**
 * Access auth client and return a mapped exit
 * @template T - The success type of the auth client result
 * @template R - The error type of the auth client result
 * @param {(client: typeof auth) => Promise<AuthClientResult<T, R>>} fn - Function that takes the auth client and returns a promise of AuthClientResult
 * @returns {Promise<Exit.Exit<T, NonNullable<R>>>} A promise that resolves to an Exit containing either success data or failure cause
 */
export async function useAuthClientResult<T, R>(
  fn: (client: typeof auth) => Promise<AuthClientResult<T, R>>,
) {
  return authClientResultToExit(await fn(auth));
}
