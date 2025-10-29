import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { 
  Organization, 
  OrganizationInsert,
  Workspace,
  WorkspaceInsert,
  OrganizationMembership,
  WorkspaceMembership,
  Invitation
} from "../drizzle/schema";

// Organization endpoints
export const OrganizationsGroup = HttpApiGroup.make("organizations")
  .add(
    HttpApiEndpoint.get("getUserOrganizations")`/user`
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Array(Schema.Struct({
        ...Organization.fields,
        role: Schema.Literal("owner", "admin", "member", "guest"),
        workspaces: Schema.Array(Schema.Struct({
          ...Workspace.fields,
          role: Schema.Literal("owner", "admin", "member", "guest"),
        })),
      }))),
  )
  .add(
    HttpApiEndpoint.get("getOrganization")`/:organizationId`
      .setPath(Schema.Struct({ organizationId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Organization),
  )
  .add(
    HttpApiEndpoint.post("createOrganization")`/`
      .setPayload(OrganizationInsert)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Organization),
  )
  .add(
    HttpApiEndpoint.patch("updateOrganization")`/:organizationId`
      .setPath(Schema.Struct({ organizationId: Schema.UUID }))
      .setPayload(Schema.partial(OrganizationInsert))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Organization),
  )
  .add(
    HttpApiEndpoint.post("deleteOrganization")`/:organizationId/delete`
      .setPath(Schema.Struct({ organizationId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .prefix("/organizations");

// Workspace endpoints
export const WorkspacesGroup = HttpApiGroup.make("workspaces")
  .add(
    HttpApiEndpoint.get("getWorkspace")`/:workspaceId`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Workspace),
  )
  .add(
    HttpApiEndpoint.post("createWorkspace")`/`
      .setPayload(WorkspaceInsert)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Workspace),
  )
  .add(
    HttpApiEndpoint.patch("updateWorkspace")`/:workspaceId`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .setPayload(Schema.partial(WorkspaceInsert))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Workspace),
  )
  .add(
    HttpApiEndpoint.post("deleteWorkspace")`/:workspaceId/delete`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .add(
    HttpApiEndpoint.get("getWorkspaceMembers")`/:workspaceId/members`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Array(Schema.Struct({
        ...WorkspaceMembership.fields,
        user: Schema.Struct({
          id: Schema.String,
          name: Schema.String,
          email: Schema.String,
          image: Schema.optional(Schema.String),
        }),
      }))),
  )
  .add(
    HttpApiEndpoint.post("inviteToWorkspace")`/:workspaceId/invite`
      .setPath(Schema.Struct({ workspaceId: Schema.UUID }))
      .setPayload(Schema.Struct({
        email: Schema.String,
        role: Schema.Literal("owner", "admin", "member", "guest"),
      }))
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Invitation),
  )
  .prefix("/workspaces");

// Member management endpoints
export const MembersGroup = HttpApiGroup.make("members")
  .add(
    HttpApiEndpoint.patch("updateOrganizationMember")`/organization/:organizationId/:userId`
      .setPath(Schema.Struct({ 
        organizationId: Schema.UUID,
        userId: Schema.String,
      }))
      .setPayload(Schema.Struct({
        role: Schema.Literal("owner", "admin", "member", "guest"),
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(OrganizationMembership),
  )
  .add(
    HttpApiEndpoint.post("removeOrganizationMember")`/organization/:organizationId/:userId/remove`
      .setPath(Schema.Struct({ 
        organizationId: Schema.UUID,
        userId: Schema.String,
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .add(
    HttpApiEndpoint.patch("updateWorkspaceMember")`/workspace/:workspaceId/:userId`
      .setPath(Schema.Struct({ 
        workspaceId: Schema.UUID,
        userId: Schema.String,
      }))
      .setPayload(Schema.Struct({
        role: Schema.Literal("owner", "admin", "member", "guest"),
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(WorkspaceMembership),
  )
  .add(
    HttpApiEndpoint.post("removeWorkspaceMember")`/workspace/:workspaceId/:userId/remove`
      .setPath(Schema.Struct({ 
        workspaceId: Schema.UUID,
        userId: Schema.String,
      }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .prefix("/members");

// Invitation endpoints
export const InvitationsGroup = HttpApiGroup.make("invitations")
  .add(
    HttpApiEndpoint.get("getInvitation")`/:token`
      .setPath(Schema.Struct({ token: Schema.String }))
      .addError(HttpApiError.NotFound)
      .addSuccess(Schema.Struct({
        ...Invitation.fields,
        organization: Organization,
        workspace: Schema.optional(Workspace),
        invitedBy: Schema.Struct({
          id: Schema.String,
          name: Schema.String,
          email: Schema.String,
        }),
      })),
  )
  .add(
    HttpApiEndpoint.post("acceptInvitation")`/:token/accept`
      .setPath(Schema.Struct({ token: Schema.String }))
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.Unauthorized)
      .addSuccess(Schema.Struct({ 
        organization: Organization,
        workspace: Schema.optional(Workspace),
      })),
  )
  .add(
    HttpApiEndpoint.post("declineInvitation")`/:token/decline`
      .setPath(Schema.Struct({ token: Schema.String }))
      .addError(HttpApiError.NotFound)
      .addSuccess(Schema.Struct({ success: Schema.Boolean })),
  )
  .prefix("/invitations");