# 🍎 Teacher Setup Guide

> Everything you need to launch your Open Classroom on GitHub — from zero to students coding in under 30 minutes.

---

## Overview

The gitClasses framework uses three GitHub tools working together:

```
GitHub Organization          ← Your "school building"
  └── GitHub Classroom       ← Your "gradebook & assignment manager"
        └── This Template    ← Your "course materials"
              └── GitHub Pages ← Your "classroom website" (auto-deployed)
```

---

## Step 1 — Create a GitHub Organization

A GitHub Organization is the container for all student repositories.

1. Go to [github.com/organizations/new](https://github.com/organizations/new)
2. Choose **Free** (sufficient for classroom use)
3. Name it something like `your-school-cs-2025`
4. Add yourself as an owner

> 💡 **GitHub Education**: If you have a verified `.edu` email, apply at [education.github.com](https://education.github.com/) for free Team-tier benefits for your org.

---

## Step 2 — Fork or Import This Template

1. Click **"Use this template"** (button at top of this repo) → **"Create a new repository"**
2. Set the **Owner** to your organization (not your personal account)
3. Name it `curriculum-master`
4. Set visibility to **Public** (required for free GitHub Pages)
5. Click **"Create repository from template"**

Then in your new repo:
- Go to **Settings → General** → check **"Template repository"**
- Go to **Settings → Pages** → Source: **GitHub Actions**

---

## Step 3 — Connect to GitHub Classroom

1. Go to [classroom.github.com](https://classroom.github.com/) and sign in
2. Click **"New classroom"** → select your organization
3. Click **"New assignment"**:
   - **Title**: `Module 01 — Git Basics`
   - **Visibility**: Private (each student gets their own private repo)
   - **Starter code**: Search for and select `curriculum-master`
   - **Deadline**: Set your date
4. Under **"Grading and feedback"**:
   - Enable **"Enable feedback pull requests"**
   - The `classroom.yml` workflow will run automatically ✅
5. Click **"Create assignment"** → copy the **Invitation Link**

---

## Step 4 — Customize for Your Class

### Update CODEOWNERS
Edit `.github/CODEOWNERS` — replace `your-org` with your actual organization slug:
```
/curriculum-master/  @your-school-cs-2025/instructors
```

### Create Teams in Your Org
- `instructors` — add yourself and any co-teachers
- `experts` — promote Path C students here as they advance

### Set Branch Protection
In your template repo → **Settings → Branches → Add rule** for `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass (select: `AutoGrading`)
- ✅ Require 1 approval before merging

---

## Step 5 — Distribute to Students

Share the **Invitation Link** from GitHub Classroom.

When students click it, GitHub automatically:
1. Creates a private `module-01-{student-name}` repo in your org
2. Copies all template files into it
3. Triggers the `deploy-pages.yml` workflow → their course site is live in ~2 minutes

---

## 🤖 AI Course Generation (Optional but Recommended)

gitClasses includes an AI-powered module generator backed by [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC). Instead of writing lesson content from scratch, you describe a topic and the AI builds interactive slides, quizzes, and simulations in minutes.

### How It Works

1. Open this repo in **[GitHub Codespaces](https://codespaces.new/)** (free for educators)
2. Run the generator script with your topic:
   ```bash
   chmod +x .github/scripts/generate-module.sh
   .github/scripts/generate-module.sh "Introduction to Variables" variables-intro
   ```
3. Follow the prompts — choose a free (Ollama) or paid LLM provider
4. The AI generates slides, quizzes, and interactive simulations (~3 minutes)
5. Export the classroom as HTML → the script scaffolds a module folder
6. Commit and push → open a PR to `curriculum-master` → GitHub Pages serves it

### LLM Provider Options

| Provider | Cost | Notes |
|---------|------|-------|
| **Ollama (local)** | 🆓 Free | Runs inside Codespaces; no API key needed |
| Google Gemini Flash | 💰 Very low | Best speed/quality balance; recommended paid option |
| OpenAI GPT-4o | 💰 Low | Highest quality for complex topics |
| DeepSeek | 💰 Very low | Cost-effective alternative |

> 💡 **Recommended for classrooms:** Start with Ollama — it's completely free and runs inside GitHub Codespaces with no setup beyond the devcontainer.

### What AI Can Generate for You

| Content Type | Description |
|------------|-------------|
| **Slides** | AI-narrated lecture slides with spotlight and laser pointer effects |
| **Quizzes** | Multiple choice, short answer, with instant AI grading |
| **Simulations** | Interactive HTML5 experiments (physics, flowcharts, 3D models) |
| **PBL Activities** | Project-based learning with role assignments and milestones |

### AI in the Student Workflow (Automatic)

Once deployed, AI works in the background for every student — **no extra setup required:**

- **When the AutoGrader fails:** AI explains the failure in plain English and suggests a fix
- **When a PR is opened:** AI posts a structured review guide for both the submitter and reviewer
- **When a student is stuck:** Opening Codespaces gives them a live AI tutor for the current module topic

---

## 📊 Monitoring Progress

| Tool | What It Shows |
|------|--------------|
| [GitHub Classroom Dashboard](https://classroom.github.com/) | Who accepted, AutoGrader scores, submission status |
| Org → Repositories | All student repos at a glance |
| Pull Request labels | `needs-peer-review` = waiting on peers, `contract-approved` = ready to work |
| Actions tab (any student repo) | Full AutoGrader log with test output |

### Downloading Grades
GitHub Classroom Dashboard → your assignment → **"Download grades"** → CSV  
Columns: Student name, GitHub username, repo URL, points earned, submission timestamp.

---

## 🔧 Autograding Configuration

The tests in `curriculum-master/modules/module-01-basics/tests/test_basics.py` are pre-configured.

To add or modify tests:
1. Edit the test file
2. Commit to `main` in `curriculum-master`
3. Students' repos will pick up changes on their next push

> ⚠️ If you change point values, update `.github/workflows/classroom.yml` `max-score` accordingly.

---

## 📋 Launch Checklist

- [ ] GitHub Organization created
- [ ] `curriculum-master` repo created from this template
- [ ] Repo marked as "Template repository" in Settings
- [ ] GitHub Pages source set to "GitHub Actions"
- [ ] GitHub Classroom connected to your org
- [ ] Assignment created with `curriculum-master` as starter code
- [ ] Autograding enabled in assignment settings
- [ ] CODEOWNERS updated with your org slug
- [ ] Branch protection rules set on `main`
- [ ] Invitation link shared with students

---

## ❓ FAQ

**Q: Do students need to pay for GitHub?**  
A: No. GitHub Free is sufficient. Students with a `.edu` email can get GitHub Pro free via [education.github.com](https://education.github.com/students).

**Q: What if a student accidentally pushes to `main`?**  
A: Branch protection will block the push. They'll see an error explaining they need to create a feature branch.

**Q: Can I use this without GitHub Classroom?**  
A: Yes! Students can manually fork the template. You lose the centralized gradebook but keep all other features.

**Q: How do I add a new module?**  
A: Copy `module-01-basics/` → rename it → update `curriculum-master/README.md` module map → update `classroom.yml` to include the new tests.
