/**
 * Manual testing file for ESC/POS printer library
 * Use this file to test your printer implementation
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: '_192_168_1_250',
  printerType: 'USB',
  paperSize: 80,
  content: [
    {
      barcodeContent: '018F0F64-8C8C-7C3A-BC4D-5C1B2D7F9A21',
      type: 'CODE128',
      align: 'center',
      height: 80,
      textPosition: 'below',
    }
    /*{
      src: './src/assets/img/logo_empresa.png',
      align: 'center',
      width: 300,
      height: 50,
    },
    {
      text: 'Tienda "La Abejita Feliz año á"',
      align: 'center',
    },
    {
      cut: true,
    },
    {
      openDrawer: true,
    },
    {
      text: 'RFC: ABCD800101XYZ',
      align: 'center',
    },
    {
      text: `Calle: conocido`,
      align: 'center',
    },
    {
      text: `Tel: 9991107140`,
      align: 'center',
    },
    {
      charLine: '=',
    },
    {
      charLine: '*',
    },*/
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('\u2705 Print job completed');
})();
