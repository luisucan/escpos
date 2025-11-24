/**
 * ESC/POS Thermal Printer Library
 *
 * A TypeScript library for communicating with thermal printers using ESC/POS commands.
 *
 * @packageDocumentation
 */

import { EscPosFactory } from './core/EscPosFactory';

export { EscPosCommands } from './core/EscPosCommands';

// Export types
export type Alignment = 'left' | 'center' | 'right';

// Default export
const printer = EscPosFactory.createMacOsUsbPrinter();
export { printer };
