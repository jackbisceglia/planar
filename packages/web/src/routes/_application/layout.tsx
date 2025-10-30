import { createFileRoute, Outlet, useNavigate } from "@tanstack/solid-router";
import { createEffect, Match, Switch } from "solid-js";
import { assertUserIsAuthenticated } from "~/lib/auth/assert";
import { auth } from "~/lib/auth/better-auth-client";
import { useCleanupEffectRuntime } from "~/lib/setup/client-runtime";

export const Route = createFileRoute("/_application")({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async () => {
    const authentication = await auth.getSession();

    // TODO: add logic for org checks and return from here
    assertUserIsAuthenticated(authentication.data, authentication.error);

    return { authentication: authentication.data };
  },
});

function useListOrganizations() {
  const _getOrgs = auth.useListOrganizations();

  return () => {
    const orgs = _getOrgs();
    return { ...orgs, data: orgs.data ?? [] };
  };
}

function RouteComponent() {
  const navigate = useNavigate();
  const getOrgs = useListOrganizations();
  const getActiveOrg = auth.useActiveOrganization();

  useCleanupEffectRuntime();

  // TODO: remove and move into beforeLoad
  createEffect(() => {
    const orgs = getOrgs();
    const active = getActiveOrg();

    if (orgs.isPending || active.isPending) return;

    const fallbackOrg = orgs.data.at(0);

    if (orgs.data.length === 0 || !fallbackOrg) {
      return void navigate({
        to: "/workspace/join",
      });
    }

    return void navigate({
      to: "/$workspace",
      params: { workspace: active.data?.slug ?? fallbackOrg.slug },
    });
  });

  return (
    <>
      <Switch>
        <Match
          when={getOrgs().isPending || getActiveOrg().isPending}
          children={null}
        />
        <Match when={getOrgs().data.length === 0}>
          You are not a member of any organization.
        </Match>
      </Switch>
      <Outlet />
    </>
  );
}
