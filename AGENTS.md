# AGENTS GUIDE

This document captures the operating assumptions, local tooling, and style cues that keep `@luisvillafania/escpos` maintainable and testable. Treat it as the first stop when an agent steps into the repo.

## Quick context

- Repository type: TypeScript library around ESC/POS thermal printer communication.
- Node engine: `>=14.0.0` (see `package.json`).
- Primary entry point: `dist/index.js`, generated from `src/index.ts` via `tsc`.
- Distribution layout: only `dist`, `README.md`, and `LICENSE` are published.
- Tests live alongside source in `src/__tests__` and rely on Jest + ts-jest.
- No workspace or monorepo tooling; single package with local devDependencies.

## Setup & builder commands

- `npm install` to fetch dependencies; no extra package managers are required.
- `npm run clean` deletes `dist/` so that builds start fresh.
- `npm run build` compiles TypeScript via the root `tsconfig.json`; expect output under `dist/`.
- `npm run build:watch` reruns `tsc` in watch mode for iterative development.
- `npm run prepublishOnly` chains clean + build and mirrors the packaging process used during release.

## Lint & formatting

- `npm run lint` targets all files under `src/` with `eslint --ext .ts`.
- `npm run lint:fix` is the only permitted autofix command; run it before reviews when ESLint reports failures.
- `npm run format` executes `prettier --write "src/**/*.ts"` and reforms the working tree in place.
- `npm run format:check` lets agents gate CI or pre-commit hooks without mutating the tree.
- Always run lint and format in the order lint → format → lint, especially after bulk refactors.

## Testing commands & single-test flow

- `npm run test` runs the entire Jest suite with the default configuration in `package.json`.
- `npm run test:watch` keeps Jest running and reruns on file changes for quicker feedback loops.
- `npm run test:coverage` reports coverage metrics; inspect `coverage/lcov-report/index.html` when needed.
- **Single-test rule:** use `npm run test -- <path>` so Jest sees the target file directly. For example:
  `npm run test -- src/__tests__/escpos-encoding.test.ts` runs just that suite.
- When debugging a single test block, append `-t "name of test"` after the file path.
- Use `npm run test -- --runInBand` only when parallelism causes nondeterministic output.

## Import & module conventions

- Always prefer named imports over wildcard imports (`import { parse } from 'url'`) unless the package exports a single default.
- Keep third-party imports grouped at the top of the file, followed by absolute code imports (none currently) and then relative imports.
- Within each group, sort alphabetically by module specifier for consistency and faster diffs.
- We rely on Node-style path resolution; do not introduce custom path aliases unless approved via tsconfig updates.
- Use explicit `.ts` extensions only when TypeScript cannot infer them; prefer no extensions for `.ts` files in imports.

## Formatting & whitespace

- Prettier configuration is implied from the devDependency; run `npm run format` before committing.
- Stick to two-space indentation throughout; Prettier enforces it already.
- Keep line lengths under 100 characters when practical; break long statements into stacked method calls.
- Trailing commas are encouraged in multiline arrays/objects to simplify diffs.
- Use blank lines to separate function-level blocks but avoid excessive vertical whitespace within single logical sections.

## TypeScript style rules

- Always annotate exported functions and classes with explicit parameter and return types—even when inference would work.
- Favor `readonly` for class properties and tuple members whenever mutation is unnecessary.
- Avoid `any`; prefer domain-specific interfaces or `unknown` with proper type narrowing.
- When introducing new utility types, keep them small (single responsibility) and document edge cases.
- Use union types for discriminated data models, and protect them with exhaustive `switch` statements combined with `never` throws.

## Naming conventions

- Files mirror their primary export (e.g., `printer.ts` exports `Printer`).
- Use PascalCase for exported classes/interfaces (`PrinterDriver`), camelCase for functions/variables (`encodeFeedLines`), and UPPER_SNAKE for constants (`DEFAULT_DPI`).
- Keep test names descriptive and sentence-like inside `it()`/`test()` calls.
- For error classes, suffix with `Error` (e.g., `EncodingError`).
- Prefix private helper names with `_` sparingly; rely on encapsulation instead.

## Error handling

- Throw `Error` subclasses only when a caller would want to differentiate via `instanceof`.
- Prefer returning `Result`-style objects over throwing for predictable APIs (if you implement them).
- Always include descriptive, actionable messages in thrown errors; avoid vague strings.
- When catching, log the stack trace only once and rethrow if the caller should decide the outcome.
- Never swallow errors silently; wrap them or annotate them before rethrowing so the context remains clear.

## Testing & mocking guidance

- Place mocks beside their tests in the same directory under `__tests__`.
- Use Jest's `beforeEach`/`afterEach` to reset state between tests to avoid cross-test pollution.
- Prefer explicit `expect` assertions over truthy/falsy checks—this makes failures easier to debug.
- For asynchronous tests, always return the promise or use `async/await` so Jest knows the test lifecycle.
- When mocking buffers or printers, keep fixtures small and focused (e.g., `jest.fn()` verifying argument structure).

## Dependency additions

- Add dependencies to `package.json` only when the new module is essential for printing, encoding, or testing.
- Add type definitions (`@types/foo`) when the dependency lacks built-in typing.
- Update `engines.node` only if justified by an upstream requirement and confirm the new minimum is supported by the CI runners.
- Run `npm run lint` and `npm run test` after each dependency bump to catch regressions early.

## Documentation & READMEs

- Keep README snippets up to date when APIs change; they serve as living documentation for the npm consumers.
- Document any manual setup required for end-to-end tests, along with expected hardware/environment constraints.
- When documenting newly exported utilities, show a minimal, copy-paste-ready snippet.

## Agent-specific reminders

- There are no `.cursor` or `.cursorrules` folders in this repo; no extra cursor rules apply.
- There is no `.github/copilot-instructions.md`; ignore Copilot-specific directives.
- Always double-check `git status` before running formatting commands.
- If you touch `dist/`, treat it as derived code and avoid committing unless explicitly part of a release path.
- When in doubt, follow the patterns already present in `src/`; this file simply codifies them.

## Suggested workflow

- Pull the latest `main` before making edits; conflicts should be resolved by rebasing.
- Run `npm run lint` and `npm run test` locally; capture failing suites in a single rerun for diagnostics.
- Stage only source/test files; generated artifacts from `dist/` should not be part of working commits.
- Provide a short body in PRs describing what changed and why; refer reviewers to failing cases you addressed.
- If you introduce new commands or scripts, document them here along with their purpose.

## Build outputs & distribution

- `dist/` is the only generated content shipped to npm; keep it in `.gitignore` except for explicit release commits.
- Verify `dist/index.js` matches `src/index.ts` changes before publishing; mismatches are easy to spot with `npm run build` + `git diff -- dist`.
- Release workflow runs `npm run prepublishOnly`, so skip manual `dist` edits unless you are preparing a published version.
- When trimming bundle size, double-check iconv-lite and bwip-js subtrees to avoid unused binaries sneaking in.
- If you must patch a dependency manually, document the patch in `README.md` and keep it in sync with the next upstream release.
- Run `npm run clean` between tests that rely on fresh `dist/` files to avoid stale imports or cached metadata.
## Troubleshooting & debugging

- If Jest reports `ts-jest` compilation errors, delete `node_modules/.cache` and rerun `npm run test`.
- Use `NODE_ENV=test` when debugging differences between development and CI runs to match preset Babel/transpile behavior.
- `npm run test -- --runInBand` is helpful when you suspect shared state or resource conflicts between suites.
- `npm run lint -- --max-warnings=0` catches soft lint failures (Jest config recommends zero warnings before release).
- For flaky timeouts, increase Jest's `testTimeout` locally via `jest --testTimeout=10000` to see if the issue is environmental.
- When running `tsc`, include `--noEmit` to verify typing without touching `dist/` or rerunning the full build.

## Security & sensitive data

- Never commit API keys, certificates, or private printer configurations; store them in an encrypted store or use environment variables.
- Treat `iconv-lite` encodings carefully and prefer safe, documented charsets to avoid accidental leaks via fallback logic.
- Ensure any manual test prints or receipts in documentation omit live customer data or real tokens.
- Escalate suspicious dependency behavior (excessive network, exec) to the maintainer list before merging.
- When patching third-party drivers (bwip-js, qrcode), capture the minimal diff and comment on the risk of future upstream merges.

## Local development tips

- Use `npm run build:watch` with `tsc --pretty false` for faster incremental builds when editing helpers.
- Keep `src/__tests__` and `src/printer.ts` open simultaneously when working on encoding logic; they are tightly coupled.
- If the printer fixture needs updating, extract reusable buffers to `src/__tests__/fixtures` instead of duplicating bytes.
- Run `npm run test -- --runInBand` + `-t "pattern"` when you are developing a single jest test to avoid noisy logs.
- Document the reasoning behind any concurrency change inside the test file so future maintainers understand the trade-offs.
