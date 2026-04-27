#!/bin/bash
# ============================================================
# generate-module.sh — gitClasses AI Module Generator
# ============================================================
# Calls the OpenMAIC API to generate an interactive classroom,
# then guides you through exporting and committing it.
#
# Usage:
#   chmod +x .github/scripts/generate-module.sh
#   .github/scripts/generate-module.sh "Introduction to Python" python-basics
#
# Requirements:
#   - Run inside GitHub Codespaces (or locally with Node.js 20+, pnpm)
#   - OpenMAIC submodule initialized: git submodule update --init
#   - At least one LLM provider key (or Ollama running locally)
# ============================================================

set -euo pipefail

TOPIC="${1:-}"
MODULE_SLUG="${2:-}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
GENERATOR_DIR="$REPO_ROOT/generator"
MODULE_DIR="$REPO_ROOT/curriculum-master/modules/module-ai-${MODULE_SLUG}"

# ── Validate args ──────────────────────────────────────────
if [ -z "$TOPIC" ] || [ -z "$MODULE_SLUG" ]; then
  echo "Usage: $0 \"Your Topic\" your-module-slug"
  echo "Example: $0 \"Introduction to Git\" git-intro"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  🤖 gitClasses — AI Module Generator                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Topic  : $TOPIC"
echo "  Module : module-ai-${MODULE_SLUG}"
echo "  Output : ${MODULE_DIR}/"
echo ""

# ── Check OpenMAIC submodule ───────────────────────────────
if [ ! -f "$GENERATOR_DIR/package.json" ]; then
  echo "⚠️  OpenMAIC generator not found. Initializing submodule..."
  git submodule update --init --recursive
fi

# ── Check/configure API key ───────────────────────────────
ENV_FILE="$GENERATOR_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  cp "$GENERATOR_DIR/.env.example" "$ENV_FILE"
fi

if ! grep -qE "^(OPENAI|ANTHROPIC|GOOGLE|DEEPSEEK|OLLAMA)_" "$ENV_FILE" 2>/dev/null || \
   grep -qE "^(OPENAI_API_KEY|ANTHROPIC_API_KEY)=your_" "$ENV_FILE" 2>/dev/null; then

  echo "⚠️  No LLM provider configured. Choose one:"
  echo ""
  echo "  [1] Ollama — FREE, runs locally (recommended for classrooms)"
  echo "  [2] OpenAI GPT-4o — requires API key"
  echo "  [3] Google Gemini Flash — requires API key"
  echo "  [4] Anthropic Claude — requires API key"
  echo "  [5] Skip — I'll configure .env.local manually"
  echo ""
  read -rp "Choice [1-5]: " PROVIDER_CHOICE

  case "$PROVIDER_CHOICE" in
    1)
      echo "OLLAMA_BASE_URL=http://localhost:11434" >> "$ENV_FILE"
      echo "DEFAULT_MODEL=ollama:llama3.2" >> "$ENV_FILE"
      echo ""
      echo "✅ Ollama configured. Make sure it's running: ollama serve"
      echo "   If you haven't pulled a model: ollama pull llama3.2"
      ;;
    2)
      read -rp "OpenAI API Key (sk-...): " OAI_KEY
      echo "OPENAI_API_KEY=$OAI_KEY" >> "$ENV_FILE"
      echo "DEFAULT_MODEL=openai:gpt-4o" >> "$ENV_FILE"
      echo "✅ OpenAI configured."
      ;;
    3)
      read -rp "Google API Key: " GOOG_KEY
      echo "GOOGLE_API_KEY=$GOOG_KEY" >> "$ENV_FILE"
      echo "DEFAULT_MODEL=google:gemini-3-flash-preview" >> "$ENV_FILE"
      echo "✅ Gemini configured."
      ;;
    4)
      read -rp "Anthropic API Key (sk-ant-...): " ANT_KEY
      echo "ANTHROPIC_API_KEY=$ANT_KEY" >> "$ENV_FILE"
      echo "DEFAULT_MODEL=anthropic:claude-sonnet-4-5" >> "$ENV_FILE"
      echo "✅ Claude configured."
      ;;
    *)
      echo "Skipping — edit generator/.env.local then re-run."
      exit 0
      ;;
  esac
  echo ""
fi

# ── Install dependencies if needed ────────────────────────
if [ ! -d "$GENERATOR_DIR/node_modules" ]; then
  echo "📦 Installing OpenMAIC dependencies (first run only)..."
  cd "$GENERATOR_DIR"
  pnpm install --frozen-lockfile
  cd "$REPO_ROOT"
fi

# ── Start OpenMAIC server ──────────────────────────────────
echo "🚀 Starting OpenMAIC server on port 3000..."
cd "$GENERATOR_DIR"
pnpm dev &
SERVER_PID=$!
cd "$REPO_ROOT"

# Trap to kill server on exit
trap 'echo ""; echo "🛑 Shutting down OpenMAIC server..."; kill $SERVER_PID 2>/dev/null' EXIT

echo "⏳ Waiting for server to start..."
for i in {1..20}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ OpenMAIC is ready!"
    break
  fi
  sleep 2
done

# ── Submit generation job ──────────────────────────────────
echo ""
echo "📡 Submitting generation request..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/generate-classroom \
  -H "Content-Type: application/json" \
  -d "{\"topic\": \"$TOPIC\", \"mode\": \"standard\"}") || true

CLASSROOM_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

if [ -z "$CLASSROOM_ID" ]; then
  echo ""
  echo "⚠️  Could not submit via API. Opening browser for manual generation..."
  echo "   1. Open port 3000 in the Ports tab"
  echo "   2. Type your topic: $TOPIC"
  echo "   3. Wait for generation to complete"
  echo "   4. Click Export → Interactive HTML"
  echo "   5. Unzip into: ${MODULE_DIR}/classroom/"
  echo ""
  wait $SERVER_PID
  exit 0
fi

echo "🎯 Generation job started (ID: $CLASSROOM_ID)"
echo "⏳ This takes 2-5 minutes..."
echo ""

# ── Poll for completion ────────────────────────────────────
STATUS="pending"
ATTEMPTS=0
MAX_ATTEMPTS=36  # 6 minutes

while [ "$STATUS" != "completed" ] && [ "$STATUS" != "failed" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  sleep 10
  POLL=$(curl -s "http://localhost:3000/api/generate-classroom?id=$CLASSROOM_ID" 2>/dev/null || echo '{}')
  STATUS=$(echo "$POLL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','pending'))" 2>/dev/null || echo "pending")
  ATTEMPTS=$((ATTEMPTS + 1))
  printf "\r   Status: %-12s (%.0f seconds elapsed)" "$STATUS" "$((ATTEMPTS * 10))"
done

echo ""
echo ""

# ── Scaffold module directory ──────────────────────────────
mkdir -p "${MODULE_DIR}/classroom"

# Create module README
cat > "${MODULE_DIR}/README.md" << MDEOF
# 🤖 AI-Generated Module: ${TOPIC}

> This module was generated using OpenMAIC (Tsinghua University).  
> **Always verify AI-generated content** before treating it as authoritative.

---

## 📂 Contents

| File/Folder | Description |
|------------|-------------|
| \`classroom/\` | Interactive AI classroom (HTML export from OpenMAIC) |
| \`ai-learning-log.md\` | Your reflection on the AI-generated content |

---

## 🎓 How to Use This Module

1. Open \`classroom/index.html\` in your browser (or view via GitHub Pages)
2. Work through the slides, quizzes, and simulations
3. Fill out \`ai-learning-log.md\` — this is part of your grade!

---

## 📋 Path D — AI-Augmented Learning Log

Create \`ai-learning-log.md\` in this folder using the template in  
\`docs/learning-contract-template.md\`.

**Key questions to answer:**
- What did the AI explain well?
- What was inaccurate or oversimplified?
- What did you have to look up elsewhere to verify?

---

*Generated: $(date -u +"%Y-%m-%d") | Topic: ${TOPIC} | OpenMAIC v0.2.1*
MDEOF

# ── Final instructions ─────────────────────────────────────
if [ "$STATUS" = "completed" ]; then
  CLASSROOM_URL="http://localhost:3000/classroom/$CLASSROOM_ID"

  echo "╔══════════════════════════════════════════════════════╗"
  echo "║  ✅ AI CLASSROOM GENERATED SUCCESSFULLY!            ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
  echo "  Classroom URL: $CLASSROOM_URL"
  echo ""
  echo "  Next steps:"
  echo "  ─────────────────────────────────────────────────────"
  echo "  1. Open: $CLASSROOM_URL"
  echo "  2. Click: Export → Interactive HTML → Download ZIP"
  echo "  3. Unzip into: ${MODULE_DIR}/classroom/"
  echo "  4. Fill out: ${MODULE_DIR}/ai-learning-log.md"
  echo "  5. Commit:"
  echo "     git add curriculum-master/modules/module-ai-${MODULE_SLUG}/"
  echo "     git commit -m 'feat(ai): add AI module — ${TOPIC}'"
  echo "     git push && open a Pull Request"
  echo "  ─────────────────────────────────────────────────────"
  echo ""
  echo "  Press Ctrl+C when done to shut down the server."
  echo ""
else
  echo "⚠️  Generation did not complete within 6 minutes."
  echo "   Open http://localhost:3000 in the Ports tab to check status."
  echo "   Module directory scaffolded at: ${MODULE_DIR}/"
fi

# Keep server alive until user exits
wait $SERVER_PID
