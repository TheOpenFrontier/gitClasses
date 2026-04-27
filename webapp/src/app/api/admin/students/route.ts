import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { isTeacher } from "@/lib/env";
import {
  listOrgMembers,
  getWorkflowRunsByActor,
  listContractIssues,
} from "@/lib/github";
import { MODULE_META } from "@/lib/constants";
import type { StudentProgress, ModuleProgress } from "@/types";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { octokit, owner, repo, session } = ctx;
  const username = session.user.githubUsername;

  if (!isTeacher(username)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch members and contracts in parallel
  const [members, contracts] = await Promise.all([
    listOrgMembers(octokit, owner),
    listContractIssues(octokit, owner, repo),
  ]);

  // Exclude teachers from the student list
  const students = members.filter((m) => !isTeacher(m.login));

  // Build progress for each student
  const studentProgress: StudentProgress[] = await Promise.all(
    students.map(async (student) => {
      const runs = await getWorkflowRunsByActor(
        octokit,
        owner,
        repo,
        student.login
      );

      // Find contract for this student
      const contract = contracts.find(
        (c) =>
          c.username.toLowerCase() === student.login.toLowerCase() ||
          c.username.includes(student.login)
      );

      // Compute per-module progress
      const moduleSlugs = Object.keys(MODULE_META);
      const modules: ModuleProgress[] = moduleSlugs.map((slug) => {
        const meta = MODULE_META[slug];
        const moduleRuns = runs.filter(
          (r) =>
            r.name.toLowerCase().includes(slug) ||
            r.name.toLowerCase().includes(meta.title.toLowerCase())
        );

        const latestRun = moduleRuns[0];
        const passed =
          latestRun?.status === "completed" &&
          latestRun?.conclusion === "success";

        return {
          moduleSlug: slug,
          moduleTitle: meta.title,
          latestRun,
          score: passed ? meta.maxScore : 0,
          maxScore: meta.maxScore,
          attempts: moduleRuns.length,
          passed,
        };
      });

      const overallScore = modules.reduce((sum, m) => sum + m.score, 0);
      const overallMaxScore = modules.reduce((sum, m) => sum + m.maxScore, 0);

      const lastRun = runs[0];

      return {
        username: student.login,
        name: student.login,
        avatarUrl: student.avatarUrl,
        modules,
        contractStatus: contract?.status || "none",
        contractIssueNumber: contract?.number,
        learningPath: contract?.learningPath,
        lastActivity: lastRun?.createdAt,
        overallScore,
        overallMaxScore,
      };
    })
  );

  return NextResponse.json({ students: studentProgress });
}
