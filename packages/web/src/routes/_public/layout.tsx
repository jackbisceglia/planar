import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
