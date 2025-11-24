# ESC/POS Thermal Printer Library

A TypeScript library for communicating with ESC/POS thermal printers. This library provides an easy-to-use API for generating print commands for receipt printers, POS printers, and other thermal printing devices.

## Features

- ✨ Written in TypeScript with full type definitions
- 🎯 Simple, chainable API
- 📦 Zero dependencies
- 🔧 Support for common ESC/POS commands
- 💪 Works with Node.js 14+

## Installation

```bash
npm install escpos
```

## Usage

### Basic Example

```typescript
import { EscPosPrinter } from 'escpos';

const printer = new EscPosPrinter();

// Create a simple receipt
printer
  .initialize()
  .align('center')
  .bold(true)
  .size(2, 2)
  .text('MY STORE')
  .feed(1)
  .bold(false)
  .size(1, 1)
  .text('123 Main Street')
  .feed(2)
  .align('left')
  .text('Item 1.................. $10.00')
  .feed(1)
  .text('Item 2.................. $15.00')
  .feed(1)
  .text('--------------------------------')
  .feed(1)
  .align('right')
  .bold(true)
  .text('TOTAL: $25.00')
  .feed(3)
  .cut();

// Get the buffer to send to printer
const buffer = printer.getBuffer();

// Send to printer (example with a writable stream)
await printer.print(printerStream);
```

### CommonJS

```javascript
const { EscPosPrinter } = require('escpos');

const printer = new EscPosPrinter();
printer
  .initialize()
  .text('Hello World')
  .feed(2)
  .cut();

const buffer = printer.getBuffer();
```

## API Reference

### EscPosPrinter

The main printer class with a chainable API.

#### Methods

- `initialize()` - Initialize the printer
- `text(content: string)` - Print text
- `feed(lines?: number)` - Feed paper (default: 1 line)
- `align(alignment: 'left' | 'center' | 'right')` - Set text alignment
- `bold(enabled?: boolean)` - Set bold text (default: true)
- `size(width?: number, height?: number)` - Set text size (1-8, default: 1)
- `cut(partial?: boolean)` - Cut paper (default: full cut)
- `getBuffer()` - Get the complete print buffer
- `clear()` - Clear the buffer
- `print(stream?: NodeJS.WritableStream)` - Print to stream or get buffer

### EscPosCommands

Low-level ESC/POS command generators if you need more control.

## Examples

Check the `examples/` directory for more usage examples:

```bash
node examples/basic.js
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## Publishing to NPM

1. Update version in `package.json`
2. Build the project: `npm run build`
3. Publish: `npm publish`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

