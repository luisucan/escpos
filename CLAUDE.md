# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Compile TypeScript → dist/
npm run build:watch    # Watch mode
npm run clean          # Remove dist/
npm run lint           # ESLint on src/
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier on src/
npm test               # Run all Jest tests
npm run test:watch     # Watch mode tests
npm run test:coverage  # Coverage report
```

Run a single test file:
```bash
npx jest test/escpos-commands.test.ts
```

Run tests matching a name:
```bash
npx jest -t "cut()"
```

Build before publishing — `prepublishOnly` runs `clean && build` automatically.

## Architecture

This is a TypeScript npm package (`@luisvillafania/escpos`) that generates and sends ESC/POS byte sequences to thermal printers.

### Core layers

**`EscPosCommands`** (`src/core/EscPosCommands.ts`)  
Pure static methods that return raw `Buffer` objects for each ESC/POS command (align, bold, text, cut, image, barcode, QR, etc.). Text is encoded with `iconv-lite` as CP437 by default. This is the lowest layer — no I/O.

**`EscPosPage`** / **`EscPosPageBuilder`** (`src/core/page/`)  
`EscPosPage` is the data structure describing a print job: printer name, paper size (58 or 80 mm), `codeTable`, and a `content` array of typed elements. `EscPosPageBuilder.build(page)` is a static async method that iterates `content`, calls the appropriate private method for each element type (text, image, QR, barcode, table, lineBreak, cut, openDrawer), and returns a single concatenated `Buffer`. Images and QR codes are rasterized here using `jimp` and `qrcode`.

**`EscPosPrinterImpl`** (`src/core/EscPosPrinterImp.ts`)  
Abstract base class with a chainable fluent API (initialize, text, feed, align, bold, size, cut, getBuffer, clear). Subclasses must implement `print(page)` and `getListPrinters()`.

**Platform implementations** (`src/core/usb/`)  
- `EscPosPrinterMacOs` — uses `lp -o raw` (CUPS) for macOS and Linux; `lpstat -p` to list printers.  
- `EscPosPrinterWindowsOs` — uses PowerShell with Win32 spooler P/Invoke to send RAW data; uses `Get-CimInstance Win32_Printer` (fallback: `wmic`) to list printers.

**`EscPosFactory`** (`src/core/EscPosFactory.ts`)  
Reads `os.platform()` at startup and returns the correct implementation. Linux is routed to `EscPosPrinterMacOs` (CUPS path).

**Entry point** (`src/index.ts`)  
Exports all public types and a ready-made `printer` singleton created by `EscPosFactory.createOsUsbPrinter()`.

### Content type dispatch

`EscPosPageBuilder` identifies content items by duck-typing (checking for `'text' in item`, `'src' in item`, `'qrContent' in item`, etc.) rather than a discriminated union tag. When adding new content types, add a unique property key and a matching `if` branch in `EscPosPageBuilder.initialize()`.

### Paper widths

| Paper | Pixel width | Char width |
|-------|-------------|------------|
| 80 mm | 576 px      | 48 chars   |
| 58 mm | 384 px      | 32 chars   |

`EscPosPageBuilder` uses these constants to calculate image rasterization and table column widths.

### Character encoding

All text goes through `iconv.encode(content, 'cp437')`. The active code table is set at the start of every page via `EscPosCommands.selectCodeTable(page.codeTable ?? 0)`. To support other code pages, pass a different `codeTable` number in `EscPosPage` and pass the matching `iconv` encoding name to `EscPosCommands.text()`.
