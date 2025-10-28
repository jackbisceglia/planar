import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/_public")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
