import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github";
import { env } from "@/lib/env";

export async function getAuthenticatedContext() {
  const session = await auth();
  if (!session?.accessToken) {
    return null;
  }

  const octokit = createOctokit(session.accessToken);
  return {
    session,
    octokit,
    owner: env.githubOrg,
    repo: env.githubRepo,
  };
}
