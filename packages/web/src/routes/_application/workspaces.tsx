import { createFileRoute, Link } from "@tanstack/solid-router";
import { Cause, Exit } from "effect";
import { For } from "solid-js";
import { withAuthClient } from "~/lib/auth/hooks";
import { Card, CardContent } from "~/lib/components/ui/card";
import { Flex } from "~/lib/components/ui/flex";
import { useAppContext } from "~/lib/use-app-context";
import { useNavigate } from "@tanstack/solid-router";
import { DOMElement } from "solid-js/jsx-runtime";

type AndTargets = {
  currentTarget: HTMLAnchorElement;
  target: DOMElement;
};

export const Route = createFileRoute("/_application/workspaces")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const context = useAppContext();

  const authentication = () => context().authentication;
  const workspaces = () => context().workspaces;

  function handleSelectWorkspace(id: string, slug: string) {
    async function customHandler(e: MouseEvent & AndTargets) {
      e.preventDefault();

      const active = await withAuthClient((c) =>
        c.organization.setActive({
          organizationId: id,
          organizationSlug: slug,
        }),
      );

      if (Exit.isFailure(active)) {
        alert(Cause.pretty(active.cause));
        return;
      }

      void navigate({ to: "/$workspace", params: { workspace: slug } });
    }

    return (e: MouseEvent & AndTargets) => {
      void customHandler(e);
    };
  }

  return (
    <>
      {/* Header */}
      {/* TODO: abstract */}
      <nav class="z-10">
        <Flex justifyContent="end" alignItems="start">
          <Flex
            flexDirection="col"
            alignItems="start"
            class="text-left w-min ml-auto py-4 px-5 gap-y-0.5"
          >
            <p class="text-muted-foreground text-xs">Logged in as</p>
            <p class="text-foreground text-sm">{authentication().user.email}</p>
          </Flex>
        </Flex>
      </nav>

      {/* Main Content */}
      <div class="fixed inset-0 z-0 flex items-center justify-center px-4">
        <div class="flex flex-col w-full max-w-[460px] mx-auto space-y-8 text-left">
          {/* Title Section */}
          <h1 class="text-2xl font-medium text-balance text-center mb-6">
            Your workspaces
          </h1>

          {/* Workspace Cards */}
          <div class="flex flex-col gap-3">
            <For each={workspaces()}>
              {(workspace) => (
                <Link
                  onClick={handleSelectWorkspace(workspace.id, workspace.slug)}
                  to="/$workspace"
                  params={{ workspace: workspace.slug }}
                  class="block group"
                >
                  <Card class="w-full border border-border/60 hover:border-border transition-all duration-200 cursor-pointer bg-card hover:shadow-sm">
                    <CardContent class="p-5 relative">
                      <div class="flex items-center gap-4">
                        {/* Thin colored accent bar */}
                        <div class="w-0.5 h-8 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                        <div class="flex-1">
                          <p class="text-base font-medium text-foreground">
                            {workspace.name}
                          </p>
                          <p class="text-sm text-muted-foreground/70 mt-0.5">
                            /{workspace.slug}
                          </p>
                        </div>
                        {/* Simple arrow icon on hover */}
                        <svg
                          class="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </For>
          </div>
        </div>
      </div>
    </>
  );
}
