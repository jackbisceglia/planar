import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { Card, CardContent } from "~/lib/components/ui/card";
import { Badge } from "~/lib/components/ui/badge";
import { Flex } from "~/lib/components/ui/flex";
import { Button } from "~/lib/components/ui/button";
import { withAuthClient } from "~/lib/auth";
import { Cause, Exit } from "effect";
import { requireValueNonNullishExit } from "@planar/core/lib/effect/index";
import { InvalidWorkspaceError } from "~/lib/workspace";
import { prevented } from "~/lib/utils";
import { ArrowLeft } from "~/lib/components/arrows";

export const Route = createFileRoute("/_application/workspaces")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const context = Route.useRouteContext();

  const user = () => context().authentication.user;
  const workspace = () => context().workspaces.active;

  function handleSelectWorkspace(id: string, slug: string) {
    async function asyncHandler() {
      const WorkspaceSelectionError = new InvalidWorkspaceError(
        "Error selecting new workspace",
      );

      const nextWorkspace = await withAuthClient((c) =>
        c.organization.setActive({
          organizationId: id,
          organizationSlug: slug,
        }),
      );

      nextWorkspace.pipe(
        Exit.flatMap(requireValueNonNullishExit(WorkspaceSelectionError)),
        Exit.match({
          onSuccess: () => {
            void navigate({
              to: "/$workspace",
              params: { workspace: slug },
              reloadDocument: true,
            });
          },
          onFailure: (cause) => {
            // TODO: (toastify)
            window.alert(Cause.pretty(cause));
          },
        }),
      );
    }

    return prevented(asyncHandler);
  }

  return (
    <>
      {/* Header */}
      {/* TODO: abstract */}
      <nav class="z-10">
        <Flex justifyContent="between" alignItems="center">
          <Show when={workspace()}>
            {(active) => (
              <Link
                to="/$workspace"
                params={{ workspace: active().slug }}
                class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft />
                Back to {active().name}
              </Link>
            )}
          </Show>
          <Flex
            flexDirection="col"
            alignItems="start"
            class="text-left w-min ml-auto py-4 px-5 gap-y-0.5"
          >
            <p class="text-muted-foreground text-xs">Logged in as</p>
            <p class="text-foreground text-sm">{user().email}</p>
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
            <For each={context().workspaces.list}>
              {(w) => {
                const isActive = () => w.id === workspace()?.id;

                return (
                  <Link
                    onClick={handleSelectWorkspace(w.id, w.slug)}
                    to="/$workspace"
                    params={{ workspace: w.slug }}
                    class="block group transition-all"
                    classList={{
                      "pointer-events-none": isActive(),
                    }}
                    aria-disabled={isActive()}
                    disabled={isActive()}
                  >
                    <Card
                      class="w-full border border-border/60 transition-all duration-200 bg-card"
                      classList={{
                        "hover:border-border": !isActive(),
                        "hover:shadow-sm": !isActive(),
                        "border-primary/60 bg-primary/10 text-foreground ring-1 ring-primary/40 ring-offset-2 ring-offset-background shadow-sm":
                          isActive(),
                      }}
                    >
                      <CardContent class="p-5 relative">
                        <div class="flex items-center gap-4">
                          {/* Thin colored accent bar */}
                          <div
                            class="w-0.5 h-8 rounded-full transition-colors"
                            classList={{
                              "bg-primary/10": !isActive(),
                              "group-hover:bg-primary/40": !isActive(),
                              "bg-primary": isActive(),
                            }}
                          ></div>
                          <div class="flex-1">
                            <p class="text-base font-medium">{w.name}</p>
                            <p class="text-sm text-muted-foreground/70 mt-0.5">
                              /{w.slug}
                            </p>
                          </div>
                          {/* Simple arrow icon on hover */}
                          <svg
                            class="w-4 h-4 text-muted-foreground/30 transition-all duration-200 opacity-0 -translate-x-1"
                            classList={{
                              "group-hover:text-muted-foreground/60":
                                !isActive(),
                              "group-hover:opacity-100": !isActive(),
                              "group-hover:translate-x-0": !isActive(),
                            }}
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
                        <Show when={isActive()}>
                          <Badge
                            round
                            variant="soft"
                            class="select-none rounded-md absolute top-4 right-4 px-2 py-1"
                          >
                            Active
                          </Badge>
                        </Show>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }}
            </For>

            {/* Create New Workspace Button */}
            <Link to="/join" class="block mt-4">
              <Button
                variant="outline"
                class="w-full h-auto p-4 border-dashed border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create new workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
