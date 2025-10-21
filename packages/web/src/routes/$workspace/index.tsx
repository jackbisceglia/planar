import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/$workspace/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>Hello "/$workspace-slug/" index!</div>
    </>
  );
}
