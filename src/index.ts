/**
 * ESC/POS Thermal Printer Library
 *
 * A TypeScript library for communicating with thermal printers using ESC/POS commands.
 *
 * @packageDocumentation
 */

export { EscPosPrinter, EscPosCommands } from './printer';

// Export types
export type Alignment = 'left' | 'center' | 'right';

// Default export
export { EscPosPrinter as default } from './printer';
