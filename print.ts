/**
 * Manual testing file for ESC/POS printer library
 * Use this file to test your printer implementation
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: '80',
  content: [
    {
      text: 'Hello, ESC/POS Printer!',
    },
  ],
} as EscPosPage;

printer.print(page);
