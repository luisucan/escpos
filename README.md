# ESC/POS Thermal Printer Library

TypeScript library for generating and sending ESC/POS commands to thermal printers.

## Installation

```bash
npm i @luisvillafania/escpos
```

## Quick start

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [
    { text: 'Hello world', align: 'center', bold: true },
    { charLine: '-' },
    { text: 'Thank you for your purchase' },
  ],
};

(async () => {
  await printer.print(page);
})();
```

## Usage on macOS (CUPS)

This library uses `lp -o raw` to send ESC/POS bytes.

1. List installed printers:

```bash
lpstat -p
```

2. Use the exact name in `page.printer`.

Quick example (macOS):

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [{ text: 'macOS Ticket', bold: true }, { charLine: '-' }, { text: 'CUPS RAW OK' }],
};

(async () => {
  const printers = await printer.getListPrinters();
  console.log(
    'Available:',
    printers.map((p) => p.name)
  );
  await printer.print(page);
})();
```

## Usage on Windows

The implementation uses PowerShell to send RAW data to the spooler.

1. List printers:

```powershell
Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name
```

Fallback (older systems):

```powershell
wmic printer get name
```

## Usage on Linux

At the moment **Linux is not tested**. The library is focused on printing via **USB** interface and network/serial adapters are not supported yet.

Note: Linux typically uses CUPS (like macOS), but this library has not been validated on Linux distributions. If you decide to try it, use the printer names from `lpstat -p` and be aware that support is experimental.

Quick example (Windows):

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'POS-80C',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [
    { text: 'Test ticket', bold: true },
    { charLine: '-' },
    { text: 'RAW print OK' },
  ],
};

(async () => {
  const printers = await printer.getListPrinters();
  console.log(
    'Available:',
    printers.map((p) => p.name)
  );
  await printer.print(page);
})();
```

## Page structure (`EscPosPage`)

- `printer`: string, printer name (CUPS or Windows).
- `printerType`: `USB | NETWORK | SERIAL`.
- `paperSize`: `58 | 80` (mm).
- `codeTable`: number (optional). Default `0` (CP437).
- `content`: array of elements to print (see below).

## Available elements in `content`

### Text (`EscPosText`)

Prints plain text.

Properties:

- `text` (string): content.
- `bold` (boolean): bold formatting.
- `size` ({ width, height }): scale from 1 to 8.
- `align` ('left' | 'center' | 'right').

### Image (`EscPosImage`)

Converts an image to ESC/POS raster format.

Properties:

- `src` (string): local path or URL.
- `type` ('local' | 'url').
- `threshold` (number): 0–255, lower value = darker.
- `width` (number): target width in pixels (default: full paper width).
- `height` (number): target height in pixels (default: auto/proportional).
- `align` ('left' | 'center' | 'right'): horizontal alignment when image is narrower than the paper.

### QR Code (`EscPosQrCode`)

Generates a QR code as an image and prints it.

Properties:

- `qrContent` (string): text or URL.
- `alignment` ('left' | 'center' | 'right').
- `size` (number): scale (default 8).
- `errorLevel` ('L' | 'M' | 'Q' | 'H').

### Barcode (`EscPosBarcode`)

Sends native ESC/POS barcode commands (`GS k`) directly to the printer.

Properties:

- `barcodeContent` (string): data to encode.
- `type` ('UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128'): optional, defaults to `CODE128`.
- `height` (number): height in dots (default 162).
- `width` (number): module width 2–6 (default 3). Use `2` for longer codes.
- `textPosition` ('none' | 'above' | 'below' | 'both'): HRI text position (default 'below').
- `align` ('left' | 'center' | 'right').

**Character limits per paper size** (CODE128):

| `width` | 80mm (~576 dots) | 58mm (~384 dots) |
|---------|-----------------|-----------------|
| 2       | ~22 chars        | ~13 chars        |
| 3       | ~13 chars        | ~7 chars         |

> For data longer than ~22 characters (e.g. UUIDs), use `EscPosQrCode` instead.

Example:

```ts
{
  barcodeContent: 'C-123456789012',
  type: 'CODE128',
  align: 'center',
  width: 2,
  textPosition: 'below',
}
```

### Separator line (`EscPosLineBreak`)

Prints one or more lines with a repeated character.

Properties:

- `lines` (number): number of lines.
- `charLine` (string): character to repeat.

### Cut (`EscPostCut`)

Cuts the paper using ESC/POS.

Properties:

- `cut` (boolean): true to cut.
- `feedLines` (number): lines before the cut (if applicable).

### Open drawer (`EscPosOpenDrawer`)

Sends the command to open the cash drawer.

Properties:

- `openDrawer` (boolean).

### Table (`EscPosTable`)

Prints rows with aligned columns.

Properties:

- `header` (EscPosTableCell[]): optional header row.
- `headerBold` (boolean): forces bold on the header.
- `rows` (EscPosTableCell[][]): data rows.
- `columnWidths` (number[]): percentages per column, automatically normalized.
- `lineChar` (string): separator character (default `-`).
- `align` ('left' | 'center' | 'right'): default alignment.
- `rowSpacing` (number): blank lines between rows (default 1).
- `footerLine` (boolean): closing line at the bottom of the table (default true).

`EscPosTableCell`:

- `text` (string)
- `align` ('left' | 'center' | 'right')
- `bold` (boolean)

## Table example

```ts
import { EscPosPage, EscPosPrinterType, EscPosTable, printer } from 'escpos';

const table: EscPosTable = {
  header: [
    { text: 'Product', align: 'left' },
    { text: 'Qty', align: 'center' },
    { text: 'Price', align: 'right' },
  ],
  headerBold: true,
  columnWidths: [60, 20, 20],
  lineChar: '-',
  rowSpacing: 1,
  footerLine: true,
  rows: [
    [
      { text: 'Coca-Cola 500ml', align: 'left' },
      { text: '2', align: 'center' },
      { text: '$20.00', align: 'right' },
    ],
  ],
};

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [table],
};

(async () => {
  await printer.print(page);
})();
```

## Notes

- `printer` must match the system printer name (CUPS or Windows).
- For images, adjust `threshold` to darken or lighten the output.
- Barcodes use native ESC/POS commands (`GS k`) — no image rendering involved.
- QR codes are rendered as raster images; if generation fails, text is printed as a fallback.

## Troubleshooting

- Strange characters in text: adjust `codeTable` to match your printer's code page.
- Very light print: lower `threshold` on images or use `bold` on text.
- Not printing on Windows: confirm the printer name matches and that PowerShell is available.
- Not printing on macOS/Linux: confirm `lpstat -p` and that CUPS is active.
- On Windows, if PowerShell blocks execution, open a console as administrator and allow scripts with:
  `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- To avoid changing the global policy, you can run the app with:
  `powershell -ExecutionPolicy Bypass -File your-script.ps1`
- To revert the current user's policy:
  `Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser`
- Security note: avoid using `Bypass` in production unless you understand the implications.

## Development

```bash
npm run lint
npm run format
npm test
```

## License

MIT
