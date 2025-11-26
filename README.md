# ThamAI — Corrected Project (frontend + backend) with render.yaml

This archive fixes the `src/` nesting issue and provides:
- frontend/ (static site)
- backend/ (Node.js Express app)
- render.yaml (Render auto-config)
- .github/workflows/deploy-pages.yml (deploy frontend to GitHub Pages)
- Instructions below.

## Quick steps to use
1. Replace your repo contents with the files from this ZIP (or merge).
2. Commit & push to GitHub.
3. Set up Render linking the repository (Render will read render.yaml).
4. On Render: add environment variable `OPENAI_API_KEY` if you want OpenAI calls.
5. Ensure GitHub Pages is configured to use the `gh-pages` branch (the workflow will push there).

See full instructions in the original README in the repo.
