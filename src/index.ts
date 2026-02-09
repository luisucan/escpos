/**
 * ESC/POS Thermal Printer Library
 *
 * A TypeScript library for communicating with thermal printers using ESC/POS commands.
 *
 * @packageDocumentation
 */

import { EscPosFactory } from './core/EscPosFactory';

export { EscPosCommands } from './core/EscPosCommands';

// Export public types
export type { EscPosPrinter } from './core/EscPostPrinter';
export type { PrinterInfo } from './core/interfaces/PrinterInfo';
export type {
  EscPosBarcode,
  EscPosImage,
  EscPosLineBreak,
  EscPosOpenDrawer,
  EscPosPage,
  EscPosPaperSize,
  EscPosQrCode,
  EscPosText,
} from './core/page/EscPosPage';
export { EscPosPrinterType } from './core/page/EscPosPage';

// Export types
export type Alignment = 'left' | 'center' | 'right';

// Default export
const printer = EscPosFactory.createOsUsbPrinter();
export { printer };
