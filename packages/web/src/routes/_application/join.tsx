import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { Button } from "~/lib/components/ui/button";
import {
  TextFieldInput,
  TextFieldLabel,
  useBoundTextField,
} from "~/lib/components/ui/text-field";
import { Flex } from "~/lib/components/ui/flex";
import { Card, CardContent } from "~/lib/components/ui/card";
import { prevented } from "~/lib/utils";
import { auth } from "~/lib/auth";
import { ArrowLeft } from "~/lib/components/arrows";

export const Route = createFileRoute("/_application/join")({
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const navigate = useNavigate();
  const workspaceUrlBase = "planar.app/";

  const user = () => context().authentication.user;
  const workspace = () => context().workspaces.active;

  // Form state
  const [[name, setName], NameTextField] = useBoundTextField("");
  const [[slug, setSlug], SlugTextField] = useBoundTextField("");

  // Stub handlers
  async function handleSubmit() {
    const reset = () => {
      setName("");
      setSlug("");
    };

    const org = await auth.organization.create({
      name: name(),
      slug: slug(),
      keepCurrentActiveOrganization: false,
    });

    if (org.error) {
      alert(org.error.message);
      return;
    }

    reset();
    void navigate({
      to: "/$workspace",
      params: { workspace: org.data.slug },
    });
  }

  return (
    <>
      {/* Header */}
      <nav class="z-10">
        <Flex justifyContent="between" alignItems="center">
          <Show when={workspace()}>
            {(w) => (
              <Link
                to="/$workspace"
                params={{ workspace: w().slug }}
                class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft />
                Back to Planar
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
        <form
          onSubmit={prevented(handleSubmit)}
          class="flex flex-col w-full max-w-[460px] mx-auto space-y-8 text-left"
        >
          {/* Title Section */}
          <h1 class="text-2xl font-medium text-balance text-center mb-6">
            Create a new workspace
          </h1>
          <p class="text-muted-foreground text-center">
            Workspaces are shared environments where teams can work on projects,
            cycles and issues.
          </p>

          <Card class="w-full border-none">
            <CardContent class="p-6 pb-8 space-y-6">
              <NameTextField>
                <TextFieldLabel class="text-sm text-primary-foreground">
                  Workspace Name
                </TextFieldLabel>
                <TextFieldInput
                  autofocus
                  class="text-base p-3 h-auto"
                  placeholder=""
                />
              </NameTextField>

              <SlugTextField>
                <TextFieldLabel class="text-sm text-primary-foreground">
                  Workspace URL
                </TextFieldLabel>
                <div class="relative flex items-center">
                  <span class="absolute z-10 left-3.5 text-muted-foreground text-sm">
                    {workspaceUrlBase}
                  </span>
                  <TextFieldInput
                    autofocus
                    class="z-0 text-sm p-3 pl-21 h-auto"
                  />
                </div>
              </SlugTextField>
              <p class="text-muted-foreground text-sm">
                This workspace will be hosted in the United States.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" class="mx-auto max-w-72 w-full">
            Create workspace
          </Button>
        </form>
      </div>
    </>
  );
}
