import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { isTeacher } from "@/lib/env";
import {
  listOrgMembers,
  listContractIssues,
} from "@/lib/github";
import type { ClassroomOverview } from "@/types";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { octokit, owner, session } = ctx;
  const username = session.user.githubUsername;

  if (!isTeacher(username)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [members, contracts] = await Promise.all([
    listOrgMembers(octokit, owner),
    listContractIssues(octokit, owner, ctx.repo),
  ]);

  const students = members.filter((m) => !isTeacher(m.login));
  const pendingContracts = contracts.filter((c) => c.status === "pending");
  const approvedContracts = contracts.filter((c) => c.status === "approved");

  const overview: ClassroomOverview = {
    totalStudents: students.length,
    contractsSubmitted: contracts.length,
    contractsApproved: approvedContracts.length,
    averageScore: 0,
    moduleCompletionRates: {},
  };

  return NextResponse.json({
    overview,
    pendingContracts: pendingContracts.map((c) => ({
      number: c.number,
      username: c.username,
      learningPath: c.learningPath,
      createdAt: c.createdAt,
    })),
  });
}
