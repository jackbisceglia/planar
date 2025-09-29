import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";

const exampleServerFn = createServerFn({ method: "GET" }).handler(() => {
  return "hello world";
});

const updateCount = createServerFn({ method: "POST" }).handler(async () => {
  const count = new Promise((resolve, _reject) => {
    resolve("Hello from the Promise!");
  });

  return count;
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await exampleServerFn(),
});

function Home() {
  const state = Route.useLoaderData();

  return (
    <>
      <h1>from the server: {state()}</h1>
      <button
        type="button"
        onClick={() => {
          void updateCount();
        }}
      >
        Add 1 to {state()}?
      </button>
    </>
  );
}
