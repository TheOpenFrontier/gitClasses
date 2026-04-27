# 🎓 gitClasses — Open Classroom Framework

> **A Udemy-styled GitHub learning system** built on Git/Fork/CI-CD workflows.  
> Teachers deploy courses in one click. Students learn through real Pull Requests, AutoGrading, and Peer Review.

---

## 🚀 Quick Start

### For Teachers
| Step | Action |
|------|--------|
| 1 | Click **"Use this template"** → create your class org repo |
| 2 | Open [GitHub Classroom](https://classroom.github.com/) → link this template as an Assignment |
| 3 | Share the **Invitation URL** — students handle the rest |

> 💡 Your course website auto-deploys to GitHub Pages the moment a student accepts the assignment.

### For Students
| Step | Action |
|------|--------|
| 1 | Click the **Invitation Link** your teacher shared |
| 2 | Accept the assignment — your private workspace is created instantly |
| 3 | Visit `Settings → Pages` to find your live course site |
| 4 | Open `module-01-basics/README.md` and choose your **Learning Path** |

---

## 🛤️ Three Learning Paths (Choose Your Own Adventure)

| Path | Who It's For | How to Start |
|------|-------------|-------------|
| **A — Guided** | New learners | Follow `module-01-basics/README.md` step by step |
| **B — Explorer** | Self-directed | Open an Issue using the **Learning Contract** template |
| **C — Expert** | Advanced | Submit a PR to the `curriculum-master` to improve the course itself |
| **D — AI-Augmented** | Curious learners | Use the OpenMAIC AI generator, then audit what it built |

---

## 🤖 How AutoGrading Works

Every `git push` triggers a GitHub Actions workflow that:
1. Runs `pytest` against your code
2. Reports a **score out of 100** directly in the PR
3. Shows a ✅ green check or ❌ red X next to your commit

**Grading Breakdown:**
| Component | Points | What It Checks |
|-----------|--------|----------------|
| Module Mastery | 50 pts | Core code logic passes tests |
| Learning Contract | 25 pts | `learning-contract.md` exists and is filled out |
| Community Contribution | 25 pts | You added a resource to `community-resources/` |

---

## 🤖 AI Tools (Path D & Teachers)

**gitClasses is AI-native** — you can generate entire interactive modules using [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC), an open-source multi-agent AI classroom built by Tsinghua University.

### For Teachers: Generate a Module in Codespaces
1. Open this repo in **[GitHub Codespaces](https://codespaces.new/TheOpenFrontier/gitClasses)**
2. In the terminal:
   ```bash
   chmod +x .github/scripts/generate-module.sh
   .github/scripts/generate-module.sh "Your Topic" module-slug
   ```
3. Follow the prompts — the AI builds slides, quizzes, and simulations (~3 min)
4. Export the HTML → commit to `curriculum-master/modules/` → open a PR

> 💡 **Free option:** Uses Ollama (local LLM) — no API key required.

### For Path D Students: Be an AI Auditor
You don't just *use* AI — you *verify* it. See [`docs/ai-learning-log-template.md`](./docs/ai-learning-log-template.md) for what to document.

---

## 🤝 Peer Review (Required for Completion)

Your PR will not be marked **Complete** until you:
1. Leave **2 meaningful code reviews** on peers' Pull Requests
2. Your PR receives **1 peer approval**

> See [COMMUNITY_GUIDELINES.md](./COMMUNITY_GUIDELINES.md) for the Code of Review.

---

## 📂 Repository Structure

```
gitClasses/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── learning_contract.md       # Student "Learning Contract" issue template
│   └── workflows/
│       ├── deploy-pages.yml           # Auto-deploys course site to GitHub Pages
│       ├── classroom.yml              # AutoGrading — runs on every push
│       └── peer-review.yml            # Posts peer review instructions on PR open
├── curriculum-master/
│   ├── README.md                      # Course overview & learning paths
│   ├── community-resources/           # Student-contributed resources (graded!)
│   └── modules/
│       ├── module-01-basics/
│       │   ├── README.md              # Objectives, paths, rubric
│       │   ├── starter-code/
│       │   │   └── app.py             # Starter file students edit
│       │   ├── tests/
│       │   │   └── test_basics.py     # AutoGrader test suite
│       │   └── resources.md           # Curated links, videos, docs
│       └── module-02-advanced/
│           ├── README.md
│           ├── starter-code/
│           └── tests/
├── COMMUNITY_GUIDELINES.md            # Code of Review & collaboration norms
└── README.md                          # ← You are here
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
