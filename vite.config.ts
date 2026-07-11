import { defineConfig } from 'vite';

// Repo name must match exactly (case-sensitive) once pushed to GitHub Pages.
const REPO_NAME = 'sandtray';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${REPO_NAME}/` : '/',
}));
