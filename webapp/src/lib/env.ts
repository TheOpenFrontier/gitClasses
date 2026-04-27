export const env = {
  githubOrg: process.env.NEXT_PUBLIC_GITHUB_ORG || "",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "gitClasses",
  modelsEndpoint:
    process.env.GITHUB_MODELS_ENDPOINT ||
    "https://models.github.ai/inference",
  modelsModel: process.env.GITHUB_MODELS_MODEL || "openai/gpt-4o-mini",
};
