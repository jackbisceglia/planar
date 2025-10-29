#!/usr/bin/env tsx

import { Effect } from "effect";
import { RuntimeCli } from "./cli-runtime";
import { Database } from "../lib/drizzle";
import { 
  organizationTable,
  workspaceTable,
  organizationMembershipTable,
  workspaceMembershipTable,
  issueTable,
} from "../lib/drizzle/schema";
import { user } from "../modules/auth/schema";

const seedOrganizations = Effect.gen(function* () {
  const db = yield* Database;

  console.log("🌱 Seeding organizations and workspaces...");

  // Get or create a test user (you should have one from auth)
  const [testUser] = yield* Effect.tryPromise({
    try: () => db.select().from(user).limit(1),
    catch: (error) => error,
  });

  if (!testUser) {
    console.log("❌ No users found. Please sign up first to create test data.");
    return;
  }

  console.log(`👤 Using user: ${testUser.name} (${testUser.email})`);

  // Create personal organization
  const [personalOrg] = yield* Effect.tryPromise({
    try: () => db
      .insert(organizationTable)
      .values({
        name: `${testUser.name}'s Personal`,
        slug: `${testUser.name.toLowerCase().replace(/\s+/g, "-")}-personal`,
        is_personal: true,
      })
      .returning()
      .onConflictDoNothing(),
    catch: (error) => error,
  });

  if (personalOrg) {
    console.log(`🏠 Created personal organization: ${personalOrg.name}`);

    // Add user as owner of personal org
    yield* Effect.tryPromise({
      try: () => db
        .insert(organizationMembershipTable)
        .values({
          userId: testUser.id,
          organizationId: personalOrg.id,
          role: "owner",
        })
        .onConflictDoNothing(),
      catch: (error) => error,
    });

    // Create personal workspace
    const [personalWorkspace] = yield* Effect.tryPromise({
      try: () => db
        .insert(workspaceTable)
        .values({
          name: "Personal",
          slug: "personal",
          organization_id: personalOrg.id,
        })
        .returning()
        .onConflictDoNothing(),
      catch: (error) => error,
    });

    if (personalWorkspace) {
      console.log(`📁 Created personal workspace: ${personalWorkspace.name}`);

      // Add user as owner of personal workspace
      yield* Effect.tryPromise({
        try: () => db
          .insert(workspaceMembershipTable)
          .values({
            userId: testUser.id,
            workspaceId: personalWorkspace.id,
            role: "owner",
          })
          .onConflictDoNothing(),
        catch: (error) => error,
      });
    }
  }

  // Create team organization
  const [teamOrg] = yield* Effect.tryPromise({
    try: () => db
      .insert(organizationTable)
      .values({
        name: "Acme Corp",
        slug: "acme-corp",
        description: "A sample team organization",
        is_personal: false,
      })
      .returning()
      .onConflictDoNothing(),
    catch: (error) => error,
  });

  if (teamOrg) {
    console.log(`🏢 Created team organization: ${teamOrg.name}`);

    // Add user as owner of team org
    yield* Effect.tryPromise({
      try: () => db
        .insert(organizationMembershipTable)
        .values({
          userId: testUser.id,
          organizationId: teamOrg.id,
          role: "owner",
        })
        .onConflictDoNothing(),
      catch: (error) => error,
    });

    // Create team workspaces
    const workspaces = [
      { name: "General", slug: "general", description: "General discussions and updates" },
      { name: "Engineering", slug: "engineering", description: "Engineering team workspace" },
      { name: "Design", slug: "design", description: "Design team workspace" },
    ];

    for (const wsData of workspaces) {
      const [workspace] = yield* Effect.tryPromise({
        try: () => db
          .insert(workspaceTable)
          .values({
            ...wsData,
            organization_id: teamOrg.id,
          })
          .returning()
          .onConflictDoNothing(),
        catch: (error) => error,
      });

      if (workspace) {
        console.log(`📁 Created workspace: ${workspace.name}`);

        // Add user as owner of workspace
        yield* Effect.tryPromise({
          try: () => db
            .insert(workspaceMembershipTable)
            .values({
              userId: testUser.id,
              workspaceId: workspace.id,
              role: "owner",
            })
            .onConflictDoNothing(),
          catch: (error) => error,
        });

        // Add some sample issues to each workspace
        const sampleIssues = [
          {
            title: `Welcome to ${workspace.name}`,
            description: `This is a sample issue in the ${workspace.name} workspace. You can create, edit, and manage issues here.`,
          },
          {
            title: "Getting Started",
            description: "Here are some tips for getting started with this workspace and managing your team's work effectively.",
          },
        ];

        for (const issueData of sampleIssues) {
          yield* Effect.tryPromise({
            try: () => db
              .insert(issueTable)
            .values({
              ...issueData,
              workspace_id: workspace.id,
            })
              .onConflictDoNothing(),
            catch: (error) => error,
          });
        }

        console.log(`  ✅ Added ${sampleIssues.length} sample issues`);
      }
    }
  }

  console.log("🎉 Organization seeding completed!");
});

const program = seedOrganizations.pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      console.error("❌ Seeding failed:", error);
      yield* Effect.fail(error);
    })
  )
);

await RuntimeCli.runPromise(program);