import { createFileRoute, redirect } from "@tanstack/solid-router";
import { auth } from "../../lib/auth/better-auth-client";
import { useProviderSignIn } from "../../lib/auth/hooks";
import { defaultWorkspace } from "../__root";
import { createIsomorphicFn } from "@tanstack/solid-start";

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

export const Route = createFileRoute("/_public/")({
  component: PublicIndexPage,
  pendingComponent: () => <div>LOADING SESSION...</div>,
  beforeLoad: async () => {
    await assertUserUnauthenticatedClientOnly();

    return { workspace: defaultWorkspace };
  },
});

function PublicIndexPage() {
  const route = Route.useRouteContext();

  const signInWithGithub = useProviderSignIn("github", route().workspace);

  return (
    <div style="min-height: 100vh; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      {/* Header */}
      <header style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: '16px 0'; position: 'sticky'; top: 0; background: 'rgba(15, 15, 15, 0.95)'; backdrop-filter: 'blur(10px)'; z-index: 50;">
        <nav style="max-width: '1200px'; margin: '0 auto'; padding: '0 24px'; display: 'flex'; align-items: 'center'; justify-content: 'space-between'; height: '64px';">
          <div class="text-4xl font-bold text-destructive">⚡ planar</div>
          <button
            onclick={() => {
              void signInWithGithub();
            }}
            style="padding: '8px 16px'; background: '#ffffff'; color: '#000000'; border: 'none'; border-radius: '6px'; font-weight: '600'; font-size: '14px'; cursor: 'pointer'; transition: 'all 0.2s';"
          >
            Sign in with Github
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style="padding: '120px 24px'; text-align: 'center'; max-width: '900px'; margin: '0 auto';">
        <h1 style="font-size: 'clamp(32px, 8vw, 64px)'; font-weight: '700'; line-height: '1.2'; margin-bottom: '24px'; letter-spacing: '-2px';">
          Plan and ship products faster
        </h1>
        <p style="font-size: '18px'; color: '#a0a0a0'; margin-bottom: '48px'; line-height: '1.6'; max-width: '600px'; margin-left: 'auto'; margin-right: 'auto';">
          Planar is a lightweight issue tracking system designed for teams that
          want to ship without the bloat. Simple, fast, and focused on what
          matters.
        </p>
        <div style="display: 'flex'; gap: '16px'; justify-content: 'center'; flex-wrap: 'wrap';">
          <button
            style="padding: '12px 32px'; background: '#ffffff'; color: '#000000'; border: 'none'; border-radius: '8px'; font-weight: '600'; font-size: '16px'; cursor: 'pointer'; transition: 'all 0.2s';"
            onmouseover={(e) => {
              e.currentTarget.style.background = "#f0f0f0";
            }}
            onmouseout={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            Get started
          </button>
          <a
            href="#features"
            style="padding: '12px 32px'; border: '1px solid rgba(255, 255, 255, 0.2)'; border-radius: '8px'; font-weight: '600'; font-size: '16px'; cursor: 'pointer'; text-decoration: 'none'; transition: 'all 0.2s'; display: 'inline-block'; color: '#ffffff';"
            onmouseover={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onmouseout={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style="padding: '120px 24px'; background: 'rgba(255, 255, 255, 0.02)'; border-top: '1px solid rgba(255, 255, 255, 0.1)';"
      >
        <div style="max-width: '1200px'; margin: '0 auto';">
          <h2 style="font-size: '36px'; font-weight: '700'; text-align: 'center'; margin-bottom: '64px'; letter-spacing: '-1px';">
            Why Planar?
          </h2>
          <div style="display: 'grid'; grid-template-columns: 'repeat(auto-fit, minmax(300px, 1fr))'; gap: '32px';">
            {/* Feature 1 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">⚡</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Lightning fast
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                No unnecessary overhead. Built for speed from the ground up.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">🎯</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Focused features
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                Everything you need for issue tracking, nothing you don't.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">🤝</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Team collaboration
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                Built for teams to communicate and collaborate seamlessly.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">🔄</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Real-time updates
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                See changes instantly across your team. No page refreshes.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">📊</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Project insights
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                Understand project health at a glance with clear metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              style="padding: '32px'; border: '1px solid rgba(255, 255, 255, 0.1)'; border-radius: '12px'; background: 'rgba(255, 255, 255, 0.02)'; transition: 'all 0.2s';"
              onmouseover={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onmouseout={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style="font-size: '32px'; margin-bottom: '16px';">🚀</div>
              <h3 style="font-size: '18px'; font-weight: '600'; margin-bottom: '12px';">
                Ready to scale
              </h3>
              <p style="color: '#a0a0a0'; line-height: '1.6';">
                From solo projects to large teams, Planar grows with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style="padding: '120px 24px'; text-align: 'center';">
        <div style="max-width: '600px'; margin: '0 auto';">
          <h2 style="font-size: '40px'; font-weight: '700'; margin-bottom: '24px'; letter-spacing: '-1px';">
            Ready to ship?
          </h2>
          <p style="font-size: '16px'; color: '#a0a0a0'; margin-bottom: '32px'; line-height: '1.6';">
            Start tracking issues and collaborating with your team today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style="border-top: '1px solid rgba(255, 255, 255, 0.1)'; padding: '40px 24px'; background: 'rgba(255, 255, 255, 0.02)';">
        <div style="max-width: '1200px'; margin: '0 auto'; display: 'flex'; justify-content: 'space-between'; align-items: 'center'; flex-wrap: 'wrap'; gap: '32px';">
          <div style="font-weight: '600';">⚡ planar</div>
          <div style="color: '#a0a0a0'; font-size: '14px';">
            © 2025 Planar. A lightweight issue tracker for teams that ship.
          </div>
        </div>
      </footer>
    </div>
  );
}
