import { Logo } from "./logo";

export function SettingUpWorkspace() {
  return (
    <div class="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div class="flex flex-col items-center text-center text-muted-foreground">
        <Logo class="text-5xl motion-safe:animate-pulse text-accent-foreground/60" />
        <p class="mt-6 max-w-xs text-sm font-medium leading-6 text-muted-foreground/80">
          Preparing Your Workspace
        </p>
      </div>
    </div>
  );
}
