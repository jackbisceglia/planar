/// <reference types="vite/client" />
import { HydrationScript } from "solid-js/web";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/solid-router";
import css from "../index.css?url";
import { ParentProps } from "solid-js";

// TODO: this should be dynamic based on the user/session
export const defaultWorkspace = "planar";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "planar" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: css },
    ],
  }),
  errorComponent: (error) => {
    return (
      <div>uh oh, something went wrong - {JSON.stringify(error, null, 2)}</div>
    );
  },
  context: () => ({ workspace: defaultWorkspace }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell(props: ParentProps) {
  return (
    <html class="dark">
      <head>
        <HydrationScript />
      </head>
      <body class="h-svh min-h-svh">
        <HeadContent />
        {props.children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
