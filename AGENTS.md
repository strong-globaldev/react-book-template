# Repository Guidelines

## Project Structure & Module Organization
- React + TypeScript sources live in `src/`, with feature folders (`components/Book`, `components/Hotspot`, `components/UI`) exporting via `components/index.ts`.
- Reusable logic sits in `src/hooks`, helpers in `src/utils`, shared styles in `src/styles`, and ambient types in `src/types`.
- Static assets for page renders belong in `src/assets/images`, while public favicon and HTML shells stay in `public/`. Keep book page files named `page-XX.jpg` to match `App.tsx` expectations.

## Build, Test, and Development Commands
- `yarn dev` starts Vite with hot reload; use it for live editing.
- `yarn build` runs `tsc -b` then `vite build` to emit optimized assets under `dist/`.
- `yarn preview` serves the built bundle for release checks.
- `yarn lint` applies the shared ESLint config (`eslint.config.js`); run it before every PR.

## Coding Style & Naming Conventions
- Stick to 2-space indentation, double quotes in TSX, and functional React components. Prefer `PascalCase` for components (`BookSpread.tsx`), `camelCase` for utilities/hooks (`usePagination.ts`), and hyphenated Tailwind utility classes.
- Centralize exports via local `index.ts` barrels when adding new modules. Keep Tailwind classes declarative and grouped by layout → spacing → typography for readability.
- ESLint with TypeScript, React Hooks, and React Refresh plugins enforces most rules; fix all autofixable issues (`yarn lint --fix`) before review.

## Testing Guidelines
- No automated suite ships yet; new features should add component tests with Vitest + React Testing Library placed alongside the subject file as `ComponentName.test.tsx`.
- Favor interaction-driven tests (keyboard navigation, hotspot activations) and aim for meaningful coverage of newly added logic. Document manual QA steps in the PR when automated coverage is not feasible.

## Commit & Pull Request Guidelines
- Follow the existing conventional format `type(scope): short summary`, e.g. `feat(book): add hotspot overlays`. Use imperative verbs and keep scope names aligned with top-level folders.
- PRs need a concise description of changes, linked issue (if any), screenshots or screen recordings for visual updates, and a checklist of test commands executed. Request review once lint passes and the preview build is verified.
