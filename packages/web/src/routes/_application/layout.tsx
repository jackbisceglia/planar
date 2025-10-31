import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { assertUserIsAuthenticated } from "~/lib/auth/assert";
import { auth } from "~/lib/auth/better-auth-client";
import { useCleanupEffectRuntime } from "~/lib/setup/client-runtime";

const beforeLoadAsync = async function () {
  const authentication = await auth.getSession();
  // const orgs = await auth.organization.list();

  // TODO: add logic for org checks and return from here
  assertUserIsAuthenticated(authentication.data, authentication.error);

  return { authentication: authentication.data };
};

export const Route = createFileRoute("/_application")({
  ssr: false,
  component: RouteComponent,
  beforeLoad: beforeLoadAsync,
});

function RouteComponent() {
  useCleanupEffectRuntime();

  return (
    <main class="p-4 min-h-full flex flex-col">
      <Outlet />
    </main>
  );
}
