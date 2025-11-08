import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { Exit } from "effect";
import { assertUserIsAuthenticated, withAuthClient } from "~/lib/auth";
import { useCleanupEffectRuntime } from "~/lib/setup/client-runtime";
import { handleTopLevelWorkspaceNavigation } from "~/lib/workspace";

export const Route = createFileRoute("/_application")({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async function (options) {
    const pathname = options.location.pathname;

    const [authentication, list, active] = await Promise.all([
      withAuthClient((c) => c.getSession()),
      withAuthClient((c) => c.organization.list()),
      withAuthClient((c) => c.organization.getFullOrganization()),
    ]);

    assertUserIsAuthenticated(authentication);
    await handleTopLevelWorkspaceNavigation(active, list, pathname);

    return {
      authentication: authentication.value,
      workspaces: {
        active: Exit.getOrElse(active, () => null),
        list: Exit.getOrElse(list, () => null),
      },
    };
  },
});

function RouteComponent() {
  useCleanupEffectRuntime();

  return (
    <main class="p-4 min-h-full flex flex-col">
      <Outlet />
    </main>
  );
}
