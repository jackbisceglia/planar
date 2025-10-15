import { createFileRoute } from "@tanstack/solid-router";
import { createResource, Show, Suspense } from "solid-js";
import { withRpc } from "../lib/rpc";

export const Route = createFileRoute("/")({ component: HomeRoute });

const fallbacks = {
  fetching: () => <p>Loading...</p>,
  notFound: () => <p>User Not Found</p>,
};

const getIssue = withRpc("fetchUser")((rpc) =>
  rpc.issues.get({ payload: { id: "556391d7-eb75-4e5a-afce-635cc03c90c4" } }),
);

function HomeRoute() {
  const [data] = createResource(getIssue);

  return (
    <>
      <h1>testing effect rpc</h1>
      <Suspense fallback={fallbacks.fetching()}>
        <Show when={data()} fallback={fallbacks.notFound()}>
          {(d) => (
            <>
              <p>title: {d().title}</p>
              <p>description: {d().description}</p>
            </>
          )}
        </Show>
      </Suspense>
    </>
  );
}
