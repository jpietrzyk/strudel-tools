# StrudelTools

Tools for [Strudel](https://strudel.cc/) REPL — a VS Code extension providing an integrated development environment for live-coding music with Strudel.

## Features

- **Command Palette integration** — Run Strudel commands directly from VS Code (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- **Hello World command** — Starter command registered as `strudel-tools.helloWorld` to verify the extension is loaded

> This extension is in early development (v0.0.1). More Strudel-specific features are coming soon.

## Getting Started

### Prerequisites

- [VS Code](https://code.visualstudio.com/) v1.105.0 or newer
- [pnpm](https://pnpm.io/) (package manager)

### Installation from Source

```bash
git clone <repo-url>
cd strudel-tools
pnpm install
```

### Development Workflow

1. **Install recommended VS Code extensions** — The workspace recommends:
   - [TSL Problem Matcher](https://marketplace.visualstudio.com/items?itemName=amodio.tsl-problem-matcher)
   - [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

2. **Start development** — Press `F5` to launch a new VS Code Extension Development Host window with the extension loaded

3. **Run a command** — Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `Hello World`

4. **Make changes** — Edit files in `src/`, then reload the Extension Development Host window (`Ctrl+R` / `Cmd+R`) or restart from the debug toolbar

### Available Scripts

| Command | Description |
|---|---|
| `pnpm run compile` | Type-check, lint, and bundle with esbuild |
| `pnpm run watch` | Watch for changes (esbuild + TypeScript in parallel) |
| `pnpm run package` | Build production bundle (minified, no sourcemaps) |
| `pnpm run lint` | Run ESLint on `src/` |
| `pnpm run check-types` | Run TypeScript type checking (`tsc --noEmit`) |
| `pnpm run test` | Run extension test suite via `@vscode/test-cli` |
| `pnpm run compile-tests` | Compile test files to `out/` |
| `pnpm run watch-tests` | Watch and compile test files |

## Project Structure

```
strudel-tools/
├── src/
│   ├── extension.ts          # Extension entry point (activate/deactivate)
│   └── test/
│       └── extension.test.ts # Mocha-based test suite
├── esbuild.js                # Build configuration (esbuild bundler)
├── eslint.config.mjs         # ESLint flat config
├── tsconfig.json             # TypeScript config (ES2022, Node16 modules, strict)
├── .vscode-test.mjs          # VS Code test CLI config
├── package.json              # Extension manifest & dependencies
└── .vscode/
    ├── launch.json           # Debug config ("Run Extension")
    ├── settings.json         # Workspace settings
    ├── tasks.json            # Build tasks
    └── extensions.json       # Recommended extensions
```

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

None at this time. This is an initial development release.

## Release Notes

### 0.0.1

Initial scaffold with:
- Extension activation and hello world command
- esbuild bundling pipeline
- ESLint + TypeScript strict mode
- VS Code test runner setup

---

## Built With

- [TypeScript](https://www.typescriptlang.org/) 5.9 — strict mode enabled
- [esbuild](https://esbuild.github.io/) — fast bundling (CJS output, Node platform)
- [ESLint](https://eslint.org/) — with `@typescript-eslint` plugin
- [`@vscode/test-cli`](https://github.com/microsoft/vscode-test-cli) — extension testing

## Resources

- [Strudel](https://strudel.cc/) — Live-coding music in the browser
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
