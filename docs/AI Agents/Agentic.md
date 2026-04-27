To integrate OpenMAIC (Open Multi-Agent Interactive Classroom) into gitClasses, we use it as a **behind-the-scenes content engine** — AI generates the course material, GitHub delivers and assesses it.

## Core Philosophy

AI in gitClasses serves two audiences:

| Audience | AI Role |
|---------|---------|
| **Teachers** | Generate module content, quizzes, and simulations from a topic description — reducing lesson prep from hours to minutes |
| **Students** | Get plain-English explanations of test failures, contextual hints when stuck, and structured prompts to give better peer review feedback |

AI is infrastructure, not a subject. Students don't learn *about* AI — they learn *with* AI as a silent helper embedded in the workflow they're already using.

---

## Architecture Overview

```
gitClasses AI Layer
│
├── Course Generation (Teacher-facing)
│   └── OpenMAIC → generates slides, quizzes, simulations, PBL
│       ├── Export: static .html committed to curriculum-master/modules/
│       └── Live: runs in GitHub Codespaces during content creation only
│
├── AutoGrader Enhancement (Student-facing)
│   └── classroom.yml → pytest runs → AI explains failures in plain English
│       └── "Your test_hello_world_function failed because hello() returned
│            None instead of a string. Did you forget a return statement?"
│
├── Peer Review Facilitation (Student + Teacher-facing)
│   └── ai-peer-review.yml → posts structured AI draft on every PR
│       ├── Helps REVIEWERS know what to look for
│       └── Helps SUBMITTERS understand what feedback to expect
│
└── Content Q&A (Student-facing, optional Tier 2)
    └── OpenMAIC live in Codespaces → students ask the AI teacher questions
        while working through a module, without leaving their workspace
```

---

## Implementation Plan

### 1. Teacher: AI Course Generation

Teachers generate a full interactive module by describing a topic. OpenMAIC's multi-agent pipeline builds:
- Slides with voice narration
- Interactive quizzes with AI grading
- HTML5 simulations (physics, flowcharts, 3D models)
- Project-Based Learning (PBL) activities

The generated content is exported as a **self-contained `.html` file** and committed to the repo — GitHub Pages serves it statically. No backend needed for students.

**Setup (one-time per teacher):**

```bash
# Add OpenMAIC as a submodule
git submodule add https://github.com/THU-MAIC/OpenMAIC generator
git commit -m "Add OpenMAIC course generator"
```

**Generate a module:**

```bash
# Run inside GitHub Codespaces (or locally with Node 20+, pnpm)
chmod +x .github/scripts/generate-module.sh
.github/scripts/generate-module.sh "Introduction to Python Functions" python-functions
```

The script handles everything: starts OpenMAIC, submits the generation job, polls for completion, and scaffolds the module folder ready for commit.

**Supported LLM Providers (teacher configures once):**

| Provider | Cost | Best For |
|---------|------|---------|
| Ollama (local) | 🆓 Free | Schools with no budget; runs in Codespaces |
| Google Gemini Flash | 💰 Very low | Best speed/quality balance |
| OpenAI GPT-4o | 💰 Low | Highest quality output |
| Anthropic Claude | 💰 Low-medium | Strong reasoning for complex topics |
| DeepSeek | 💰 Very low | Cost-effective alternative |

---

### 2. Student: AI-Explained Test Failures

The existing `classroom.yml` AutoGrader reports pass/fail. To make failures *actionable*, the AI layer translates pytest output into student-friendly explanations.

When a test fails, instead of seeing:
```
FAILED test_hello_world_function - AssertionError
```

The student sees a PR comment like:
```
❌ test_hello_world_function failed

Your hello() function returned `None` instead of the string
"Hello, Open Classroom!". This usually means you forgot
to add a `return` statement. Try:

    def hello():
        return "Hello, Open Classroom!"

Push your fix and the AutoGrader will re-run automatically.
```

This is implemented in `ai-peer-review.yml` and the classroom workflow — no student action required.

---

### 3. Teacher + Student: AI Peer Review Facilitation

When a student opens a Pull Request, the `ai-peer-review.yml` workflow automatically:

1. **Reads the PR diff** — what files changed, what the student built
2. **Posts an AI-drafted review** with:
   - A checklist of what the human reviewer should look for
   - Specific questions tailored to the module being submitted
   - A self-assessment checklist for the submitting student
3. **Labels the PR** as `needs-human-review` — the AI draft is a *starting point*, not a final review

This reduces friction for first-time reviewers ("I don't know what to say") and helps submitters prepare their PR description more completely.

---

### 4. Codespaces: Live AI Teacher (Optional, Tier 2)

For students working through a module who get stuck, opening the repo in GitHub Codespaces gives them a live OpenMAIC session where they can:
- Ask the AI teacher questions about the current module topic
- Request explanations of code concepts without leaving their workspace
- Get hints on test failures (not answers — the AutoGrader still validates independently)

This is opt-in and requires no changes to the standard workflow. The `.devcontainer/devcontainer.json` handles all setup.

---

## Devcontainer Configuration

The `.devcontainer/devcontainer.json` sets up a complete development environment in GitHub Codespaces:

```json
{
  "name": "Open Classroom — AI Generator",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/python:1": { "version": "3.11" }
  },
  "postCreateCommand": "npm install -g pnpm && pip install pytest pytest-json-report",
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": { "label": "OpenMAIC — AI Classroom Generator" }
  }
}
```

---

## What Works Where

| Feature | GitHub Pages (Static) | GitHub Codespaces (Live) |
|---------|----------------------|--------------------------|
| AI-generated slides & narration | ✅ (HTML export) | ✅ |
| Interactive simulations & quizzes | ✅ (HTML export) | ✅ |
| AI-explained test failures | ✅ (GitHub Actions) | ✅ |
| AI peer review facilitation | ✅ (GitHub Actions) | ✅ |
| Live AI teacher Q&A / tutoring | ❌ (requires backend) | ✅ |
| Real-time whiteboard & debate | ❌ (requires backend) | ✅ |

---

## References

- [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) — v0.2.1, 16.4k ⭐, AGPL-3.0
- [OpenMAIC Tutorial](https://openmaic.io/openmaic-tutorial-getting-started.html)
- [GitHub Codespaces for Education](https://docs.github.com/en/education/manage-coursework-with-github-classroom/integrate-github-classroom-with-an-ide/using-github-codespaces-with-github-classroom)
- [GitHub Classroom AutoGrading](https://docs.github.com/en/education/manage-coursework-with-github-classroom/teach-with-github-classroom/use-autograding)
