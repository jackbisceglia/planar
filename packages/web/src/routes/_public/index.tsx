import { createFileRoute, Link, redirect } from "@tanstack/solid-router";
import { createIsomorphicFn } from "@tanstack/solid-start";
import type { ParentProps } from "solid-js";
import { auth } from "../../lib/auth/better-auth-client";
import { useProviderSignIn } from "../../lib/auth/hooks";
import { defaultWorkspace } from "../__root";
import { Button } from "~/lib/components/ui/button";
import { Separator } from "~/lib/components/ui/separator";
import { cn } from "~/lib/utils/index";
import { ParentPropsWithClass } from "~/lib/utils/solid";
import { Logo } from "~/lib/components/logo";

const assertUserUnauthenticatedClientOnly = createIsomorphicFn().client(
  async function () {
    const authentication = await auth.getSession();

    if (authentication.data) {
      redirect({
        throw: true,
        to: "/$workspace",
        params: { workspace: defaultWorkspace },
      });
    }
  },
);

function Section(props: ParentPropsWithClass<{ id?: string }>) {
  return (
    <section id={props.id} class={cn("py-24 md:py-32", props.class)}>
      {props.children}
    </section>
  );
}

function Container(props: ParentPropsWithClass) {
  return (
    <div class={cn("mx-auto w-full max-w-5xl", props.class)}>
      {props.children}
    </div>
  );
}

function Shell(props: ParentProps) {
  return (
    <div class="dark min-h-svh bg-background text-foreground">
      <div class="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_top_right,oklch(1_0_0/7%),transparent)]" />
      {props.children}
    </div>
  );
}

function Footer() {
  return (
    <footer class="border-t py-10">
      <Container>
        <div class="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div class="font-semibold text-foreground">⬗ planar</div>
          <div>
            © 2025 Planar. A lightweight issue tracker for teams that ship.
          </div>
        </div>
      </Container>
    </footer>
  );
}

export const Route = createFileRoute("/_public/")({
  component: PublicIndexPage,
  pendingComponent: () => <div>LOADING SESSION...</div>,
  beforeLoad: async () => {
    // how to run client only but on first load
    await assertUserUnauthenticatedClientOnly();

    return { workspace: defaultWorkspace };
  },
});

function PublicIndexPage() {
  const route = Route.useRouteContext();

  const signInWithGithub = useProviderSignIn("github", route().workspace);

  return (
    <Shell>
      <header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav class="max-w-5xl flex h-16 items-center justify-between mx-auto">
          <Link
            to="."
            class="flex items-center gap-2 text-xl tracking-tight text-primary"
          >
            <Logo /> planar
          </Link>

          <Button
            class="flex items-center gap-3"
            size="sm"
            onClick={() => {
              void signInWithGithub();
            }}
          >
            Login with Github
          </Button>
        </nav>
      </header>

      <Section class="relative overflow-hidden pt-28 pb-40 md:pt-28 md:pb-56">
        <HeroBackground />
        <HeroGraphic />
        {/* section-wide dimming layer to avoid visible box edges */}
        <div class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,oklch(0.147_0.004_49.25/60%),oklch(0.147_0.004_49.25/46%)_40%,transparent_96%)]" />
        <Container>
          <div class="relative z-20 mx-auto">
            <h1 class="text-balance text-4xl font-[510] tracking-tight md:text-[64px]">
              Planar is a purpose-built clone for tracking issues and shipping
              work
            </h1>
            <p class="mt-6 font-light text-xs text-muted-foreground md:text-lg max-w-1/2">
              Planar is a fast, minimal issue tracker. Create issues, plan
              projects, and ship work—without the bloat.
            </p>
            <div class="mt-8 flex flex-wrap items-center justify-start gap-3">
              <Button
                class="px-6"
                onClick={() => {
                  void signInWithGithub();
                }}
              >
                Get started
              </Button>
              <Button as={"a"} href="#features" variant="outline" class="px-6">
                Learn more
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Separator class="opacity-50" />

      <Section id="how-it-works" class="text-center">
        <Container>
          <div class="mx-auto max-w-2xl">
            <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to ship?
            </h2>
            <p class="mt-4 text-muted-foreground">
              Start tracking issues and collaborating with your team today.
            </p>
            <div class="mt-6 flex justify-center">
              <Button
                onClick={() => {
                  void signInWithGithub();
                }}
              >
                Start building
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </Shell>
  );
}

// comments left in for future reference/ai
function HeroBackground() {
  return (
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      {/* top-right soft glow */}
      <div class="absolute -top-40 right-[-10%] h-[620px] w-[1200px] rounded-full bg-[radial-gradient(1200px_600px_at_80%_0%,oklch(1_0_0/8%),transparent)]" />
      {/* side vignettes */}
      <div class="absolute inset-y-0 left-0 w-[280px] bg-linear-to-r from-black/30 to-transparent" />
      <div class="absolute inset-y-0 right-0 w-[220px] bg-linear-to-l from-black/20 to-transparent" />
      {/* bottom fade into page background */}
      <div class="absolute inset-x-0 bottom-0 h-[360px] bg-[linear-gradient(to_top,oklch(0.147_0.004_49.25),transparent)] opacity-80" />
    </div>
  );
}

function HeroGraphic() {
  return (
    <div
      aria-hidden="true"
      class="select-none pointer-events-none absolute inset-x-0 top-52 z-0 mx-auto block w-full max-w-5xl transform-gpu translate-x-0 sm:top-40 sm:max-w-6xl sm:-translate-x-[2%] md:top-44 md:max-w-7xl md:-translate-x-[6%]"
    >
      <div class="relative perspective-[2200px]">
        <div class="relative mx-auto w-full overflow-hidden rounded-xl border bg-card/40 shadow-2xl ring-1 ring-black/30 backdrop-blur supports-backdrop-filter:bg-card/40 transform-[rotateX(6deg)_rotateY(-8deg)_rotateZ(0deg)_scale(1.02)] sm:transform-[rotateX(10deg)_rotateY(-18deg)_rotateZ(1deg)_scale(1.06)] md:transform-[rotateX(12deg)_rotateY(-22deg)_rotateZ(1deg)_scale(1.08)]">
          {/* window chrome */}
          <div class="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
            <div class="flex gap-1.5">
              <span class="size-2.5 rounded-full bg-destructive/70" />
              <span class="size-2.5 rounded-full bg-accent/60" />
              <span class="size-2.5 rounded-full bg-primary/60" />
            </div>
            <div class="ml-auto opacity-80">planar</div>
          </div>
          <div class="grid grid-cols-[220px,1fr]">
            {/* sidebar */}
            <div class="border-r p-4">
              <div class="mb-3 text-sm font-medium text-foreground/90">
                Workspace
              </div>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="rounded-sm bg-accent/10 px-3 py-2 text-foreground">
                  Inbox
                </li>
                <li class="rounded-sm px-3 py-2">My issues</li>
                <li class="rounded-sm px-3 py-2">Projects</li>
                <li class="rounded-sm px-3 py-2">Views</li>
                <li class="rounded-sm px-3 py-2">Teams</li>
              </ul>
            </div>
            {/* content */}
            <div class="p-4">
              <div class="mb-3 flex items-center justify-between">
                <div class="h-6 w-40 rounded bg-muted/20" />
                <div class="h-8 w-24 rounded-sm border bg-background" />
              </div>
              <ul class="space-y-2">
                <li class="rounded-sm border bg-background/80 p-3">
                  <div class="flex items-center justify-between">
                    <div class="h-4 w-2/3 rounded bg-muted/30" />
                    <span class="inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      new
                    </span>
                  </div>
                </li>
                <li class="rounded-sm border bg-background/60 p-3">
                  <div class="h-4 w-1/2 rounded bg-muted/25" />
                </li>
                <li class="rounded-sm border bg-background/60 p-3">
                  <div class="h-4 w-3/4 rounded bg-muted/25" />
                </li>
                <li class="rounded-sm border bg-background/60 p-3">
                  <div class="h-4 w-2/5 rounded bg-muted/25" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* removed inner dimmer; handled at section level */}
        {/* halo */}
        <div class="pointer-events-none absolute -inset-14 -z-10 rounded-2xl bg-[radial-gradient(closest-side,oklch(1_0_0/6%),transparent)] blur-2xl" />
      </div>
    </div>
  );
}
