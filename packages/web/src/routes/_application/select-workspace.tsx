import { createFileRoute, redirect, useNavigate } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { auth } from "../../lib/auth/better-auth-client";
import { prevented } from "../../lib/utils";

export const Route = createFileRoute("/_application/select-workspace")({
  component: SelectWorkspace,
  beforeLoad: async () => {
    const session = await auth.getSession();
    if (!session.data?.user) {
      redirect({ throw: true, to: "/" });
    }
  },
});

function SelectWorkspace() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [creatingNew, setCreatingNew] = createSignal(false);
  const [newOrgName, setNewOrgName] = createSignal("");
  const [newOrgSlug, setNewOrgSlug] = createSignal("");

  // Fetch user's organizations
  (async () => {
    try {
      const result = await auth.organization.listOrganizations();
      console.log("ORGANIZATIONS", JSON.stringify(result, null, 2));
      setOrganizations(result.data || []);
    } catch (error) {
      console.log("ERROR FETCHING ORGANIZATIONS", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  })();

  const handleSelectOrganization = async (org: any) => {
    try {
      await auth.organization.setActive({
        organizationId: org.id,
      });
      void navigate({
        to: "/$workspace",
        params: { workspace: org.slug },
      });
    } catch (error) {
      console.log("ERROR SETTING ACTIVE ORGANIZATION", JSON.stringify(error, null, 2));
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const result = await auth.organization.create({
        name: newOrgName(),
        slug: newOrgSlug(),
      });
      
      console.log("CREATE ORGANIZATION RESULT", JSON.stringify(result, null, 2));
      
      if (result.data) {
        void navigate({
          to: "/$workspace",
          params: { workspace: result.data.slug },
        });
      }
    } catch (error) {
      console.log("ERROR CREATING ORGANIZATION", JSON.stringify(error, null, 2));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setNewOrgName(value);
    if (!newOrgSlug() || generateSlug(newOrgName()) === newOrgSlug()) {
      setNewOrgSlug(generateSlug(value));
    }
  };

  return (
    <div style="min-height: 100vh; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 48px 24px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px; letter-spacing: -1px;">
          Select a workspace
        </h1>
        <p style="color: #a0a0a0; margin-bottom: 32px;">
          Choose a workspace to continue or create a new one
        </p>

        <Show when={loading()}>
          <div style="text-align: center; padding: 48px;">
            <p style="color: #a0a0a0;">Loading workspaces...</p>
          </div>
        </Show>

        <Show when={!loading() && !creatingNew()}>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <For each={organizations()}>
              {(org) => (
                <button
                  onClick={() => void handleSelectOrganization(org)}
                  style="padding: 20px 24px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #ffffff; cursor: pointer; text-align: left; transition: all 0.2s; display: flex; align-items: center; gap: 12px;"
                  onmouseover={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onmouseout={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight: 600; font-size: 16px;">{org.name}</div>
                    <div style="color: #a0a0a0; font-size: 14px;">/{org.slug}</div>
                  </div>
                </button>
              )}
            </For>
          </div>

          <button
            onClick={() => setCreatingNew(true)}
            style="width: 100%; padding: 16px; background: #ffffff; color: #000000; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;"
            onmouseover={(e) => {
              e.currentTarget.style.background = "#f0f0f0";
            }}
            onmouseout={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            + Create new workspace
          </button>
        </Show>

        <Show when={creatingNew()}>
          <form onSubmit={prevented(handleCreateOrganization)}>
            <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
                  Workspace name
                </label>
                <input
                  type="text"
                  value={newOrgName()}
                  onInput={(e) => handleNameChange(e.currentTarget.value)}
                  placeholder="Acme Inc"
                  style="width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #ffffff; font-size: 16px;"
                  required
                />
              </div>

              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
                  Workspace URL
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #a0a0a0; font-size: 14px;">planar.app/</span>
                  <input
                    type="text"
                    value={newOrgSlug()}
                    onInput={(e) => setNewOrgSlug(e.currentTarget.value)}
                    placeholder="acme-inc"
                    style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: #ffffff; font-size: 16px;"
                    required
                  />
                </div>
              </div>

              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button
                  type="submit"
                  style="flex: 1; padding: 12px; background: #ffffff; color: #000000; border: none; border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;"
                  onmouseover={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onmouseout={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  Create workspace
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingNew(false)}
                  style="padding: 12px 24px; background: transparent; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;"
                  onmouseover={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                  onmouseout={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </Show>
      </div>
    </div>
  );
}
