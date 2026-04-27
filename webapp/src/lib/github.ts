import { Octokit } from "@octokit/rest";
import type { ModuleContent, WorkflowRun } from "@/types";

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export async function getOrgMembership(
  octokit: Octokit,
  org: string,
  username: string
): Promise<"admin" | "member" | null> {
  try {
    const { data } = await octokit.orgs.getMembershipForUser({
      org,
      username,
    });
    return data.role === "admin" ? "admin" : "member";
  } catch {
    return null;
  }
}

export async function isOrgAdmin(
  octokit: Octokit,
  org: string,
  username: string
): Promise<boolean> {
  const role = await getOrgMembership(octokit, org, username);
  return role === "admin";
}

export async function listModulesFromRepo(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: "curriculum-master/modules",
    });

    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item.type === "dir" && item.name.startsWith("module-"))
      .map((item) => item.name)
      .sort();
  } catch {
    return [];
  }
}

export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if ("content" in data && data.type === "file") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

export async function getModuleContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  moduleSlug: string
): Promise<ModuleContent | null> {
  const basePath = `curriculum-master/modules/${moduleSlug}`;

  const [readme, resources] = await Promise.all([
    getFileContent(octokit, owner, repo, `${basePath}/README.md`),
    getFileContent(octokit, owner, repo, `${basePath}/resources.md`),
  ]);

  if (!readme) return null;

  // Get starter code files
  const starterCode: Record<string, string> = {};
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: `${basePath}/starter-code`,
    });
    if (Array.isArray(data)) {
      const contents = await Promise.all(
        data
          .filter((f) => f.type === "file")
          .map(async (f) => ({
            name: f.name,
            content: await getFileContent(octokit, owner, repo, f.path),
          }))
      );
      for (const { name, content } of contents) {
        if (content) starterCode[name] = content;
      }
    }
  } catch {
    // no starter code dir
  }

  // Get test files
  const tests: Record<string, string> = {};
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: `${basePath}/tests`,
    });
    if (Array.isArray(data)) {
      const contents = await Promise.all(
        data
          .filter((f) => f.type === "file")
          .map(async (f) => ({
            name: f.name,
            content: await getFileContent(octokit, owner, repo, f.path),
          }))
      );
      for (const { name, content } of contents) {
        if (content) tests[name] = content;
      }
    }
  } catch {
    // no tests dir
  }

  return {
    slug: moduleSlug,
    readme,
    resources: resources || "",
    starterCode,
    tests,
  };
}

export async function triggerWorkflow(
  octokit: Octokit,
  owner: string,
  repo: string,
  workflowFile: string,
  ref: string = "main",
  inputs?: Record<string, string>
): Promise<void> {
  await octokit.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowFile,
    ref,
    inputs,
  });
}

export async function listWorkflowRuns(
  octokit: Octokit,
  owner: string,
  repo: string,
  workflowFile?: string
): Promise<WorkflowRun[]> {
  const params: Parameters<Octokit["actions"]["listWorkflowRunsForRepo"]>[0] = {
    owner,
    repo,
    per_page: 10,
  };

  const { data } = workflowFile
    ? await octokit.actions.listWorkflowRuns({
        ...params,
        workflow_id: workflowFile,
      })
    : await octokit.actions.listWorkflowRunsForRepo(params);

  return data.workflow_runs.map((run) => ({
    id: run.id,
    name: run.name || "Unknown",
    status: run.status as WorkflowRun["status"],
    conclusion: run.conclusion as WorkflowRun["conclusion"],
    createdAt: run.created_at,
    htmlUrl: run.html_url,
  }));
}

export async function createIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels: string[] = []
): Promise<number> {
  const { data } = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  });
  return data.number;
}

export async function commentOnIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<void> {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

// ─── Admin / Progress helpers ───────────────────────────────────────

export interface OrgMember {
  login: string;
  avatarUrl: string;
  role: "admin" | "member";
}

export async function listOrgMembers(
  octokit: Octokit,
  org: string
): Promise<OrgMember[]> {
  try {
    const { data } = await octokit.orgs.listMembers({
      org,
      per_page: 100,
    });

    const members = await Promise.all(
      data.map(async (m) => {
        const role = await getOrgMembership(octokit, org, m.login);
        return {
          login: m.login,
          avatarUrl: m.avatar_url,
          role: role || "member",
        } as OrgMember;
      })
    );

    return members;
  } catch {
    return [];
  }
}

export async function getWorkflowRunsByActor(
  octokit: Octokit,
  owner: string,
  repo: string,
  actor: string
): Promise<WorkflowRun[]> {
  try {
    const { data } = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      actor,
      per_page: 30,
    });

    return data.workflow_runs.map((run) => ({
      id: run.id,
      name: run.name || "Unknown",
      status: run.status as WorkflowRun["status"],
      conclusion: run.conclusion as WorkflowRun["conclusion"],
      createdAt: run.created_at,
      htmlUrl: run.html_url,
    }));
  } catch {
    return [];
  }
}

export interface ContractIssue {
  number: number;
  title: string;
  username: string; // parsed from title "[Contract] - username"
  labels: string[];
  status: "pending" | "approved" | "in-progress" | "completed";
  createdAt: string;
  body: string;
  learningPath?: "A" | "B" | "C";
}

export async function listContractIssues(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<ContractIssue[]> {
  try {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      labels: "contract-pending,contract-approved",
      state: "all",
      per_page: 100,
    });

    // Also fetch pending-only and approved-only since the above is AND logic
    const [pending, approved] = await Promise.all([
      octokit.issues.listForRepo({
        owner,
        repo,
        labels: "contract-pending",
        state: "open",
        per_page: 100,
      }),
      octokit.issues.listForRepo({
        owner,
        repo,
        labels: "contract-approved",
        state: "all",
        per_page: 100,
      }),
    ]);

    const allIssues = new Map<number, (typeof pending.data)[number]>();
    for (const issue of [...pending.data, ...approved.data]) {
      allIssues.set(issue.number, issue);
    }

    return Array.from(allIssues.values()).map((issue) => {
      const labels = issue.labels
        .map((l) => (typeof l === "string" ? l : l.name || ""))
        .filter(Boolean);

      let status: ContractIssue["status"] = "pending";
      if (labels.includes("contract-approved")) status = "approved";
      if (labels.includes("contract-in-progress")) status = "in-progress";
      if (labels.includes("contract-completed")) status = "completed";

      // Parse learning path from body
      let learningPath: "A" | "B" | "C" | undefined;
      const body = issue.body || "";
      if (body.includes("[x] **Path A")) learningPath = "A";
      else if (body.includes("[x] **Path B")) learningPath = "B";
      else if (body.includes("[x] **Path C")) learningPath = "C";

      // Extract username from title "[Contract] - Name"
      const titleMatch = issue.title.match(/\[Contract\]\s*-\s*(.+)/);
      const username = titleMatch
        ? titleMatch[1].trim()
        : issue.user?.login || "unknown";

      return {
        number: issue.number,
        title: issue.title,
        username,
        labels,
        status,
        createdAt: issue.created_at,
        body,
        learningPath,
      };
    });
  } catch {
    return [];
  }
}

export async function approveContract(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<void> {
  // Remove pending label
  try {
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: "contract-pending",
    });
  } catch {
    // label might not exist
  }

  // Add approved label
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: ["contract-approved"],
  });

  // Add approval comment
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: "✅ **Learning Contract Approved!**\n\nYour teacher has approved your learning contract. You may now begin working on the module. Good luck! 🚀",
  });
}

