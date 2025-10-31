import { getRouteApi, useNavigate } from "@tanstack/solid-router";
import { webBaseUrl } from "../utils";
import { auth } from "./better-auth-client";

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
