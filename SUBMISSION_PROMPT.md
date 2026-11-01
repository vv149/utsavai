# Prompt for Your Friend to Publish to GitHub

Copy-paste this to Claude Code (or any AI assistant) in the project directory:

---

```
Initialize a git repo, create a GitHub repository called "utsavai" under my account, and push all the code. Then give me the GitHub URL.

Steps:
1. git init
2. Create .gitignore (node_modules, .next, .env.local, coverage, test-results, playwright-report)
3. git add all files
4. git commit with message "feat: UtsavAI - AI-powered celebration & event planner for Hack2Skill PromptWars Challenge 5"
5. Create GitHub repo: gh repo create utsavai --public --source=. --push
6. Give me the repo URL
```

---

# Hack2Skill Submission Details

- **Project Name**: UtsavAI
- **Live URL**: https://utsavai-1010587631565.us-central1.run.app
- **Problem Statement**: GenAI-powered Celebration & Event Planner
- **Tech Stack**: Next.js 16, TypeScript, Google Gemini (Vertex AI), Firestore, Tailwind CSS v4, Three.js
- **Key Features**:
  - AI-powered planning with budget engine, timeline, vendor discovery
  - 625+ unit tests, 53 e2e tests
  - WCAG 2.2 AA accessible
  - Nonce-only CSP, rate limiting, prompt injection defense
  - 3D visualizations with hardware tier gating
  - Streaming AI chat, ICS calendar export
