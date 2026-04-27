To integrate OpenMAIC (Open Multi-Agent Interactive Classroom) without Vercel, we leverage **GitHub Codespaces** as the "Generation Engine" and **GitHub Pages** as the "Hosting Platform."

## The Strategy: "Generate Locally, Host Statically"

OpenMAIC requires a backend (Node.js) to run the LLM agents and generate content. Since GitHub Pages is static-only, it cannot run "Live" AI agents in real time.

**Solution:** Use OpenMAIC's **"Export to HTML"** feature (and in v0.1.1+, the ZIP classroom export).

**The Workflow:**
1. Teacher (or student) opens the repo in Codespaces — which acts as a temporary server
2. Types a topic → OpenMAIC generates the full interactive classroom
3. Exports the classroom as a self-contained `.html` file
4. Commits the file to `curriculum-master/modules/module-ai-*/`
5. GitHub Pages serves the static HTML — interactive simulations, quizzes, and slides all work ✅

---

## Implementation Plan

### 1. Add OpenMAIC as a Git Submodule

Instead of cluttering your main repo, add OpenMAIC as a tool inside a dedicated folder.

Run in your local terminal or Codespaces terminal:

```bash
git submodule add https://github.com/THU-MAIC/OpenMAIC generator
git commit -m "Add OpenMAIC generator as submodule"
```

> **Note:** OpenMAIC requires Node.js >= 20 and pnpm >= 10.

---

### 2. Configure the Generator Environment (Codespaces)

The `.devcontainer/devcontainer.json` automatically installs OpenMAIC's dependencies so neither teachers nor students need to configure anything.

Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "Open Classroom — AI Generator",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    }
  },
  "postCreateCommand": "npm install -g pnpm && cd generator && pnpm install && cp .env.example .env.local && echo '✅ OpenMAIC ready — run ./generate-module.sh \"Your Topic\" module-name'",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-python.python",
        "ms-python.vscode-pylance"
      ]
    },
    "tasks": {
      "version": "2.0.0",
      "tasks": [
        {
          "label": "🤖 Launch AI Teacher",
          "type": "shell",
          "command": "./generate-module.sh",
          "group": "build",
          "presentation": { "reveal": "always" }
        }
      ]
    }
  },
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": {
      "label": "OpenMAIC — AI Classroom Generator",
      "onAutoForward": "openBrowser"
    }
  }
}
```

---

### 3. The "One-Click" Generator Script

Add `.github/scripts/generate-module.sh` to automate the full generation-to-commit pipeline:

```bash
#!/bin/bash
# generate-module.sh
# Usage: ./generate-module.sh "Introduction to Python" python-basics
# Requires: OpenMAIC running in generator/ (started by devcontainer)

TOPIC="${1:-Enter a topic}"
MODULE_SLUG="${2:-ai-generated}"
MODULE_DIR="curriculum-master/modules/module-ai-${MODULE_SLUG}"
EXPORT_DIR="${MODULE_DIR}/classroom"

echo "🤖 Starting OpenMAIC AI Classroom Generator..."
echo "   Topic: $TOPIC"
echo "   Module: module-ai-${MODULE_SLUG}"

# 1. Check for API keys
if ! grep -q "OPENAI_API_KEY=sk-" generator/.env.local 2>/dev/null; then
  echo ""
  echo "⚠️  No API key found. Choose an option:"
  echo "   1) OpenAI (paid)  →  enter: OPENAI"
  echo "   2) Ollama (free, local)  →  enter: OLLAMA"
  read -r PROVIDER

  if [ "$PROVIDER" = "OPENAI" ]; then
    echo "Enter your OpenAI API Key:"
    read -r api_key
    echo "OPENAI_API_KEY=$api_key" >> generator/.env.local
    echo "DEFAULT_MODEL=openai:gpt-4o" >> generator/.env.local
  else
    echo "OLLAMA_BASE_URL=http://localhost:11434" >> generator/.env.local
    echo "DEFAULT_MODEL=ollama:llama3.2" >> generator/.env.local
    echo "💡 Make sure Ollama is running: ollama serve"
  fi
fi

# 2. Start OpenMAIC server (background)
cd generator
pnpm dev &
SERVER_PID=$!
echo "⏳ Waiting for OpenMAIC to start on port 3000..."
sleep 15

# 3. Submit generation job
echo "📡 Submitting generation request to OpenMAIC API..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/generate-classroom \
  -H "Content-Type: application/json" \
  -d "{\"topic\": \"$TOPIC\", \"mode\": \"standard\"}")

CLASSROOM_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CLASSROOM_ID" ]; then
  echo "❌ Generation failed. Check that OpenMAIC started correctly."
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo "✅ Generation job started: $CLASSROOM_ID"
echo "⏳ Polling for completion (this takes 2-5 minutes)..."

# 4. Poll until complete
STATUS="pending"
ATTEMPTS=0
while [ "$STATUS" != "completed" ] && [ $ATTEMPTS -lt 30 ]; do
  sleep 10
  STATUS=$(curl -s "http://localhost:3000/api/generate-classroom?id=$CLASSROOM_ID" \
    | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  ATTEMPTS=$((ATTEMPTS + 1))
  echo "   Status: $STATUS (attempt $ATTEMPTS/30)"
done

cd ..

if [ "$STATUS" != "completed" ]; then
  echo "⚠️  Timed out. Open http://localhost:3000 and export manually."
else
  echo ""
  echo "==================================================="
  echo "🎉 AI CLASSROOM READY!"
  echo ""
  echo "To publish your AI-generated module:"
  echo "  1. Open http://localhost:3000 in the Ports tab"
  echo "  2. Find your classroom and click 'Export → Interactive HTML'"
  echo "  3. Unzip the export into: ${EXPORT_DIR}/"
  echo "  4. Run: git add . && git commit -m 'feat: add AI module — ${TOPIC}'"
  echo "  5. Push and open a Pull Request to curriculum-master"
  echo "==================================================="
fi

# Keep server alive for manual export
wait $SERVER_PID
```

---

### 4. Student README Section — "Generate an AI Course"

Add this to `curriculum-master/README.md`:

```markdown
## 🤖 Path D — Generate an AI Course (Codespaces)

Want to create a custom module? Use our OpenMAIC generator.

1. **Launch the Lab:** Click [Open in GitHub Codespaces](https://codespaces.new/TheOpenFrontier/gitClasses)
2. **Start the Engine:** In the terminal, run:
   ```bash
   chmod +x .github/scripts/generate-module.sh
   .github/scripts/generate-module.sh "Your Topic" your-module-slug
   ```
3. **Build:** The AI generates slides, quizzes, and simulations (~3 min)
4. **Export:** Follow the instructions in the terminal → commit to `modules/`
5. **Document:** Create `ai-learning-log.md` — what did the AI get right? What did it miss?
```

---

## ⚠️ What Works Where

| Feature | GitHub Pages (Static) | GitHub Codespaces (Live) |
|---------|----------------------|--------------------------|
| Slides & narration | ✅ (exported HTML) | ✅ (live) |
| Interactive simulations | ✅ (exported HTML) | ✅ (live) |
| Quizzes | ✅ (exported HTML) | ✅ (live) |
| Live AI teacher Q&A | ❌ (requires backend) | ✅ |
| Roundtable debate | ❌ (requires backend) | ✅ |
| Whiteboard drawing | ❌ (requires backend) | ✅ |
| Voice TTS narration (static) | ✅ (pre-generated in export) | ✅ |

**Fix for live features:** Students open the repo in Codespaces instead of visiting the static Pages URL.

---

## LLM Provider Options

| Provider | Cost | Setup |
|---------|------|-------|
| **Ollama** (local) | 🆓 Free | Install Ollama, `ollama pull llama3.2` |
| OpenAI GPT-4o | 💰 ~$0.01/lesson | `OPENAI_API_KEY=sk-...` |
| Google Gemini Flash | 💰 Low | `GOOGLE_API_KEY=...` |
| Anthropic Claude | 💰 Medium | `ANTHROPIC_API_KEY=sk-ant-...` |
| DeepSeek | 💰 Very low | `DEEPSEEK_API_KEY=...` |

**Recommended for classrooms:** Ollama with `llama3.2` — completely free, runs in Codespaces, no API key required.

---

## References

- [THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) — v0.2.1, 16.4k ⭐
- [OpenMAIC Tutorial](https://openmaic.io/openmaic-tutorial-getting-started.html)
- [GitHub Codespaces for Education](https://docs.github.com/en/education/manage-coursework-with-github-classroom/integrate-github-classroom-with-an-ide/using-github-codespaces-with-github-classroom)
- [OpenMAIC Docker Deployment](https://github.com/THU-MAIC/OpenMAIC/blob/main/docker-compose.yml)
