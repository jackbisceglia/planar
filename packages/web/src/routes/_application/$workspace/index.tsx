import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import { withRpc } from "../../../lib/data/rpc-client";
import { prevented } from "../../../lib/utils";
import { useCurrentWorkspace } from "../../../lib/data/organizations";

const getIssues = (workspaceId: string) => 
  withRpc("get-all-issues")((rpc) => rpc.issues.getAll({ path: { workspaceId } }));

const createIssue = (workspaceId: string, issue: { title: string; description: string }) =>
  withRpc("create-issue")((rpc) => rpc.issues.create({ 
    path: { workspaceId }, 
    payload: issue 
  }));


function NewIssueForm(props: { workspaceId: string }) {
  const router = useRouter();
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  const handleSubmit = async () => {
    await createIssue(props.workspaceId, { title: title(), description: description() });
    void router.invalidate();
    setTitle("");
    setDescription("");
  };

  return (
    <form 
      onSubmit={prevented(handleSubmit)}
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "1rem",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        "border-radius": "0.5rem",
        background: "white"
      }}
    >
      <div>
        <label style={{ 
          display: "block", 
          "font-size": "0.875rem", 
          "font-weight": "500", 
          "margin-bottom": "0.5rem",
          color: "#374151"
        }}>
          Title
        </label>
        <input
          type="text"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          placeholder="Enter issue title..."
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            "border-radius": "0.375rem",
            "font-size": "0.875rem",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
      
      <div>
        <label style={{ 
          display: "block", 
          "font-size": "0.875rem", 
          "font-weight": "500", 
          "margin-bottom": "0.5rem",
          color: "#374151"
        }}>
          Description
        </label>
        <textarea
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Describe the issue..."
          required
          rows={3}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            "border-radius": "0.375rem",
            "font-size": "0.875rem",
            outline: "none",
            transition: "border-color 0.2s",
            resize: "vertical",
            "font-family": "inherit"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
      
      <button 
        type="submit"
        style={{
          "align-self": "flex-start",
          padding: "0.75rem 1.5rem",
          background: "#3b82f6",
          color: "white",
          border: "none",
          "border-radius": "0.375rem",
          "font-size": "0.875rem",
          "font-weight": "500",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        Create Issue
      </button>
    </form>
  );
}

export const Route = createFileRoute("/_application/$workspace/")({
  component: WorkspacePage,
  loader: async () => {
    // TODO: Get actual workspace ID from slug
    // For now, we'll use a placeholder - this should be resolved from the workspace slug
    const workspaceId = "placeholder-workspace-id";
    
    try {
      const issues = await getIssues(workspaceId);
      return { issues, workspaceId };
    } catch (error) {
      console.log("ERROR loading issues", JSON.stringify(error, null, 2));
      return { issues: [], workspaceId };
    }
  },
});

function WorkspacePage() {
  const data = Route.useLoaderData();
  const params = Route.useParams();
  const slug = params().workspace;
  const { currentWorkspace } = useCurrentWorkspace(slug);

  // Get the actual workspace ID from the current workspace context
  const workspaceId = () => currentWorkspace()?.workspace.id || data().workspaceId;

  return (
    <div style={{ "max-width": "800px" }}>
      <div style={{ 
        "margin-bottom": "2rem",
        "padding-bottom": "1rem",
        "border-bottom": "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          "font-size": "1.25rem", 
          "font-weight": "600", 
          "margin-bottom": "0.5rem",
          color: "#111827"
        }}>
          Issues
        </h2>
        <p style={{ color: "#6b7280", "font-size": "0.875rem" }}>
          Track and manage issues for this workspace
        </p>
      </div>

      <div style={{ "margin-bottom": "2rem" }}>
        <NewIssueForm workspaceId={workspaceId()} />
      </div>

      <div>
        <For each={data().issues} fallback={
          <div style={{ 
            "text-align": "center", 
            padding: "3rem", 
            color: "#6b7280" 
          }}>
            <p>No issues found</p>
            <p style={{ "font-size": "0.875rem", "margin-top": "0.5rem" }}>
              Create your first issue to get started
            </p>
          </div>
        }>
          {(issue) => (
            <div style={{ 
              border: "1px solid #e5e7eb",
              "border-radius": "0.5rem",
              padding: "1.5rem",
              "margin-bottom": "1rem",
              background: "white"
            }}>
              <h3 style={{ 
                "font-size": "1.125rem", 
                "font-weight": "600", 
                "margin-bottom": "0.5rem",
                color: "#111827"
              }}>
                {issue.title}
              </h3>
              <p style={{ 
                color: "#374151", 
                "line-height": "1.5" 
              }}>
                {issue.description}
              </p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
