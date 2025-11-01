import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { assertUserIsAuthenticated } from "~/lib/auth/assert";
import { useAuthClientResult } from "~/lib/auth/hooks";
import { useCleanupEffectRuntime } from "~/lib/setup/client-runtime";

export const Route = createFileRoute("/_application")({
  ssr: false,
  component: RouteComponent,
  beforeLoad: async function () {
    const result = await useAuthClientResult((c) => c.getSession());

    assertUserIsAuthenticated(result);

    return { authentication: result.value };
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
