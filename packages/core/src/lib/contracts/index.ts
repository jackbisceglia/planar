import { HttpApi, HttpApiError } from "@effect/platform";
import { IssuesGroup } from "./issues";
import { AuthGroup } from "./auth";
// TODO: Re-enable organization routes after fixing type issues
// import { 
//   OrganizationsGroup, 
//   WorkspacesGroup, 
//   MembersGroup, 
//   InvitationsGroup 
// } from "./organizations";

export const Api = HttpApi.make("Api")
  .add(IssuesGroup)
  .add(AuthGroup)
  // TODO: Re-enable organization routes after fixing type issues
  // .add(OrganizationsGroup)
  // .add(WorkspacesGroup)
  // .add(MembersGroup)
  // .add(InvitationsGroup)
  .addError(HttpApiError.InternalServerError)
  .prefix("/api");
