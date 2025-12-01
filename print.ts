/**
 * Manual testing file for ESC/POS printer library
 * Use this file to test your printer implementation
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: 80,
  content: [
    {
      src: './src/assets/img/logo_empresa.png',
    },
    {
      text: 'Hello, ESC/POS Printer!\n',
    },
    {
      text: 'This is a test print\n',
    },
    {
      text: `Date: ${new Date().toLocaleString()}\n`,
    },
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('\u2705 Print job completed');
})();
