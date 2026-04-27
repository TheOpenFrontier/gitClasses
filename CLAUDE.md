# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

**gitClasses** is a GitHub template repository for deploying Udemy-styled courses using GitHub Classroom. Teachers fork/template this repo to create a course; students get private workspace repos via GitHub Classroom invitation links. The platform is entirely GitHub-native — no external services, no API keys beyond `GITHUB_TOKEN`.

Core mechanics:
- Students push code → GitHub Actions runs `pytest` → score posted as a GitHub Check
- On test failure, AI explains the failure in plain English and posts it as a PR comment
- On test success, AI generates a bonus quiz from the student's actual code
- When a teacher comments "Approved" on a Learning Contract issue, AI generates a personalized curriculum
- Peer review is enforced: PRs aren't complete until the student has reviewed 2 peers' PRs

## Running Tests

```bash
# Module 01 — Basics
pip install pytest
pytest curriculum-master/modules/module-01-basics/tests/test_basics.py -v

# Module 02 — Branching
pytest curriculum-master/modules/module-02-branching/tests/test_calculator.py -v
```

Tests resolve the repo root via `REPO_ROOT` path calculation from `__file__` — run from any directory. The branch-naming test in Module 02 (`test_branch_exists`) auto-skips locally; it only enforces naming conventions when running inside GitHub Actions.

## Architecture

### Grading Model (100 pts per module)
| Component | Points | Mechanism |
|-----------|--------|-----------|
| Module Mastery | 50 | `pytest` tests on starter code |
| Learning Contract | 25 | `learning-contract.md` exists and has >50 chars |
| Community Contribution | 25 | Any `.md` file in `community-resources/` (excluding README) |

Module 02 uses a different split: 40/40/20 for add / subtract / branch-exists.

### GitHub Actions Workflows
- **`classroom.yml`** — Runs on every push. Invokes `classroom-resources/autograding-python-grader@v1`, then posts AI failure explanation or AI quiz via `actions/ai-inference@v1`.
- **`peer-review.yml`** — Runs on PR open. Posts peer review instructions and adds `needs-peer-review` label.
- **`contract-curriculum.yml`** — Triggered by issue comments. When a non-author comments "Approved" on an issue labeled `contract-pending`, it parses the Learning Contract body, calls AI to generate a personalized curriculum, posts it as a comment, and swaps labels to `contract-approved`.
- **`deploy-pages.yml`** — Deploys the entire repo root to GitHub Pages on every push to `main`.

### AI Prompts
All AI behavior is controlled by `.github/prompts/*.prompt.yml` — plain YAML with `messages` (system + user) and a `model` field. Currently using `openai/gpt-4o-mini` via GitHub Models (free, no external API keys). These files are the intended customization surface for teachers and Path C students.

Prompt files:
- `explain-test-failure.prompt.yml` — Called on AutoGrader failure; receives `test_output` + `student_code`
- `generate-quiz.prompt.yml` — Called on AutoGrader success; receives `student_code` + `module_topic`
- `generate-contract-curriculum.prompt.yml` — Called on contract approval; receives parsed contract fields

### Learning Paths
- **Path A (Guided)** — Follow starter code in `modules/*/starter-code/`
- **Path B (Explorer)** — Build an original project; requires Learning Contract issue approval
- **Path C (Expert)** — Submit PRs to `curriculum-master/` to improve the course itself

### Key File Locations
- Starter code: `curriculum-master/modules/module-*/starter-code/`
- Tests: `curriculum-master/modules/module-*/tests/`
- AI prompts: `.github/prompts/`
- Issue templates: `.github/ISSUE_TEMPLATE/` (learning_contract, bug_report, curriculum_improvement)
- Student-contributed resources: `curriculum-master/community-resources/`
- Required student file: `learning-contract.md` at repo root (checked by test)

## Adding a New Module

1. Create `curriculum-master/modules/module-NN-topic/` with `README.md`, `starter-code/`, `tests/`, and `resources.md`
2. Add a `tests/test_*.py` with `@pytest.mark.parametrize("points", [N])` on each test (points values are parsed by the grader reporter)
3. Add a grader step to `.github/workflows/classroom.yml` mirroring `grader-m01`, and add its ID to the `runners:` list in the reporting step
4. Update `curriculum-master/README.md` module map

## Webapp (`/webapp`)

A Next.js 16 (App Router) multi-tenant webapp that serves as both a Udemy-style course viewer and the gitClasses docs site.

### Running the Webapp

```bash
cd webapp
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
```

Requires `.env.local` — copy from `.env.local.example` and fill in GitHub OAuth credentials.

### Tech Stack
- **Next.js 16.2** with App Router, TypeScript, Tailwind CSS
- **next-auth v4** with GitHub OAuth (scopes: `read:org repo workflow`)
- **@octokit/rest** for GitHub API (trigger workflows, read repo content, create issues)
- **GitHub Models** for AI chat (OpenAI-compatible endpoint via `GITHUB_TOKEN`)
- **react-markdown + remark-gfm** for rendering curriculum markdown

### Webapp Architecture

Routes:
- `/` — Landing page (public)
- `/dashboard` — Authenticated user dashboard with stats, quick actions, workflow runs
- `/dashboard/contract` — Learning Contract submission form → creates GitHub Issue
- `/dashboard/workflows` — Trigger GitHub Actions workflows from the UI (module generation, deploy, grading)
- `/courses` — Module catalog (Udemy-style card grid)
- `/courses/[slug]` — Module detail with tabs: Guide, Starter Code, Tests, Resources
- `/ai` — AI Assistant chat interface with streaming SSE, quick prompts, module context
- `/docs` — Documentation hub
- `/docs/[slug]` — Individual doc pages (overview, teacher-setup, autograding, etc.)

API Routes:
- `/api/auth/[...nextauth]` — GitHub OAuth via next-auth v4
- `/api/github/module-content` — Fetches module content from GitHub repo via Octokit
- `/api/github/workflow-runs` — Lists recent workflow runs
- `/api/github/trigger-workflow` — Triggers a GitHub Actions workflow dispatch
- `/api/github/create-issue` — Creates an issue (used for Learning Contracts)
- `/api/ai/chat` — Streams AI chat responses via GitHub Models (OpenAI-compatible SSE)

Key lib files:
- `src/lib/auth.ts` — NextAuth config with GitHub provider
- `src/lib/github.ts` — All Octokit operations (module content, workflows, issues)
- `src/lib/api-auth.ts` — Helper to get authenticated Octokit context in API routes
- `src/lib/env.ts` — Environment variable access
- `src/lib/constants.ts` — Workflow files, grading weights, learning paths

### Multi-Tenancy
Tenant is determined by the `NEXT_PUBLIC_GITHUB_ORG` env var. The org admin role maps to "teacher"; org members are "students". All GitHub API calls are scoped to that org's repo.
