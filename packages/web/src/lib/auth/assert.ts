import { redirect } from "@tanstack/solid-router";
import { auth } from "./better-auth-client";
import { TaggedError } from "@planar/core/lib/effect/error";
import { NonNullableNested } from "@planar/core/lib/utils/index";

class InvalidWorkspaceError extends TaggedError("InvalidWorkspaceError") {}

type AuthenticationData = { data: (typeof auth.$Infer)["Session"] | null };

type AuthenticationDataChecked = NonNullableNested<
  AuthenticationData,
  "data",
  "user"
>;

export function assertUserIsAuthenticated(
  auth: AuthenticationData,
): asserts auth is AuthenticationDataChecked {
  const user = auth.data?.user;

  if (!user) {
    redirect({ throw: true, to: "/" });
  }
}

export async function assertWorkspacePathIsValid(
  _auth: AuthenticationData,
  workspaceSlug: string,
) {
  try {
    // Check if user has access to this organization
    const organizations = await auth.organization.listOrganizations();
    console.log("CHECKING WORKSPACE ACCESS", JSON.stringify({ workspaceSlug, organizations: organizations.data }, null, 2));
    
    const hasAccess = organizations.data?.some(
      (org: any) => org.slug === workspaceSlug
    );

    if (!hasAccess) {
      throw new InvalidWorkspaceError(
        "You do not have access to this workspace"
      );
    }

    // Set this organization as active
    const targetOrg = organizations.data?.find(
      (org: any) => org.slug === workspaceSlug
    );
    
    if (targetOrg) {
      await auth.organization.setActive({
        organizationId: targetOrg.id,
      });
    }
  } catch (error) {
    console.log("ERROR IN WORKSPACE VALIDATION", JSON.stringify(error, null, 2));
    throw new InvalidWorkspaceError(
      "You do not have access to this workspace"
    );
  }
}
