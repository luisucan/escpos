# AGENTS.md

This file orients agentic coding assistants working in this repo.

## Project overview

- TypeScript library for ESC/POS thermal printer communication.
- Source: `src/`
- Tests: `test/` (and `src/**/__tests__/**` if added)
- Build output: `dist/`

## Build, lint, test

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Clean build output

```bash
npm run clean
```

### Lint

```bash
npm run lint
```

### Lint (auto-fix)

```bash
npm run lint:fix
```

### Format

```bash
npm run format
```

### Format check

```bash
npm run format:check
```

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run a single test file

```bash
npm test -- test/escpos-commands.test.ts
```

### Run a single test by name

```bash
npm test -- -t "should return correct initialization command"
```

### Run a single test file and filter by name

```bash
npm test -- test/escpos-commands.test.ts -t "lineFeed"
```

### Direct Jest invocation (if needed)

```bash
npx jest test/escpos-commands.test.ts
```

## Config files to respect

- TypeScript: `tsconfig.json`
- ESLint: `eslint.config.js`
- Prettier: `.prettierrc`
- Jest: `jest.config.js`

## Code style guidelines

### Formatting (Prettier)

- Semicolons required.
- Single quotes for strings.
- Trailing commas where valid in ES5.
- Print width: 100.
- Two-space indentation, no tabs.
- Run `npm run format` after changes touching multiple files.

### Linting (ESLint + @typescript-eslint)

- Use the recommended TypeScript ESLint ruleset.
- `@typescript-eslint/no-explicit-any` is a warning; avoid `any` unless truly necessary.
- `@typescript-eslint/no-unused-vars` is error; unused args must start with `_`.
- Keep lint clean in `src/**/*.ts` only.

### TypeScript

- `strict: true` is enabled; keep types precise.
- Prefer explicit unions (e.g., `'left' | 'center' | 'right'`) over string literals.
- Use default parameter values instead of `undefined` checks when reasonable.
- Avoid implicit `any` and unsafe casts.
- Maintain `Buffer` usage patterns for ESC/POS output.

### Imports

- Prefer Node built-ins first, then external packages, then internal modules.
- Keep import paths relative within `src` (no path aliases configured).
- Use single quotes in import paths.
- Avoid unused imports; ESLint will fail.

### Naming conventions

- Classes: PascalCase (e.g., `EscPosPageBuilder`).
- Methods/functions: camelCase (e.g., `lineFeed`, `printAndFeed`).
- Constants: UPPER_SNAKE_CASE if used (see `EscPosCommands`).
- Types/interfaces: PascalCase; prefer `EscPosX` prefix for library types.
- Filenames: PascalCase when exporting a class, matching class name.

### Error handling

- Throw `Error` with a clear message for unsupported runtime states (see `EscPosFactory`).
- Use `try/catch` around IO or external library calls (Jimp/QRCode/bwip-js).
- Log errors with context; avoid swallowing failures silently.
- Prefer failing fast over returning partial buffers when correctness matters.

### API behavior expectations

- Command builders return `Buffer` values.
- Methods in printer implementations should be chainable and return `this`.
- Keep `EscPosPage` content processing order stable; it drives output layout.

## Repository-specific notes

- Tests are TypeScript and run via `ts-jest`.
- `tsconfig.json` excludes test files from build output.
- `jest.config.js` includes `test/` and `src/` roots.
- Node.js >= 14 required.

## Cursor and Copilot rules

- No `.cursor/rules/` found.
- No `.cursorrules` found.
- No `.github/copilot-instructions.md` found.

## When adding new code

- Match existing patterns in `src/core` and `src/core/page`.
- Keep public exports in `src/index.ts` small and intentional.
- Update tests when changing ESC/POS command output behavior.
