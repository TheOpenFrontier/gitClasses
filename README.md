# 🎓 gitClasses — Open Classroom Framework

> **A Udemy-styled GitHub learning system** built on Git/Fork/CI-CD workflows.  
> Teachers deploy courses in one click. Students learn through real Pull Requests, AutoGrading, and Peer Review.  
> AI works behind the scenes to generate content, explain test failures, and assist with feedback — so teachers teach and students learn.

---

## 🚀 Quick Start

### For Teachers
| Step | Action |
|------|--------|
| 1 | Click **"Use this template"** → create your class org repo |
| 2 | Open [GitHub Classroom](https://classroom.github.com/) → link this template as an Assignment |
| 3 | *(Optional)* Generate AI-powered modules — see [TEACHER_SETUP.md](./docs/TEACHER_SETUP.md#ai-course-generation) |
| 4 | Share the **Invitation URL** — students handle the rest |

> 💡 Your course website auto-deploys to GitHub Pages the moment a student accepts the assignment.

### For Students
| Step | Action |
|------|--------|
| 1 | Click the **Invitation Link** your teacher shared |
| 2 | Accept the assignment — your private workspace is created instantly |
| 3 | Visit `Settings → Pages` to find your live course site |
| 4 | Open `module-01-basics/README.md` and choose your **Learning Path** |

> 🤖 An AI assistant will guide you through stuck points, explain test failures, and help you give better peer reviews — automatically.

---

## 🛤️ Three Learning Paths (Choose Your Own Adventure)

| Path | Who It's For | How to Start |
|------|-------------|-------------|
| **A — Guided** | New learners | Follow `module-01-basics/README.md` step by step |
| **B — Explorer** | Self-directed | Open an Issue using the **Learning Contract** template |
| **C — Expert** | Advanced | Submit a PR to the `curriculum-master` to improve the course itself |

> AI is available on every path — as a hint engine, an explainer, and a writing assistant for feedback.

---

## 🤖 How AutoGrading Works

Every `git push` triggers a GitHub Actions workflow that:
1. Runs `pytest` against your code
2. **AI explains any failures in plain English** — you see *why* a test failed, not just that it did
3. Reports a **score out of 100** directly in the PR
4. Shows a ✅ green check or ❌ red X next to your commit

**Grading Breakdown:**
| Component | Points | What It Checks |
|-----------|--------|----------------|
| Module Mastery | 50 pts | Core code logic passes tests |
| Learning Contract | 25 pts | `learning-contract.md` exists and is filled out |
| Community Contribution | 25 pts | You added a resource to `community-resources/` |

---

## 🤝 Peer Review (Required for Completion)

Your PR will not be marked **Complete** until you:
1. Leave **2 meaningful code reviews** on peers' Pull Requests
2. Your PR receives **1 peer approval**

> 💬 When you open a PR, an AI assistant automatically posts a structured review checklist and suggests specific questions for your peer reviewer to consider — helping both sides give and receive better feedback.

See [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md) for the Code of Review.

---

## 📂 Repository Structure

```
gitClasses/
├── .devcontainer/
│   └── devcontainer.json          # One-click Codespaces environment
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── learning_contract.md   # Student "Learning Contract" issue template
│   │   ├── bug_report.md          # Curriculum bug reports
│   │   └── curriculum_improvement.md
│   ├── scripts/
│   │   └── generate-module.sh     # Teacher: AI module generator (OpenMAIC)
│   └── workflows/
│       ├── deploy-pages.yml       # Auto-deploys course site to GitHub Pages
│       ├── classroom.yml          # AutoGrading — runs on every push
│       ├── peer-review.yml        # Posts peer review checklist on PR open
│       └── ai-peer-review.yml     # AI-assisted review draft for teacher/student aid
├── curriculum-master/
│   ├── README.md                  # Course overview & module map
│   ├── community-resources/       # Student-contributed resources (graded!)
│   └── modules/
│       ├── module-01-basics/
│       │   ├── README.md          # Objectives, paths, rubric
│       │   ├── starter-code/app.py
│       │   ├── tests/test_basics.py
│       │   └── resources.md
│       └── module-02-branching/
│           ├── README.md
│           ├── starter-code/
│           └── tests/
├── docs/
│   ├── AI Agents/Agentic.md       # AI integration architecture
│   ├── TEACHER_SETUP.md           # Full teacher deployment guide
│   └── Implementation Plan/       # Planning documents
├── COMMUNITY_GUIDELINES.md        # Code of Review & collaboration norms
└── README.md                      # ← You are here
```

---

## 🏆 Completion Checklist

- [ ] Learning Contract issue opened and teacher-approved
- [ ] `learning-contract.md` committed to your repo
- [ ] AutoGrader passing (green check on latest commit)
- [ ] 2 peer PR reviews left (link them in your PR description)
- [ ] 1 resource added to `curriculum-master/community-resources/`

---

*Built on the Open Classroom model — where everyone is both a teacher and a student.*
