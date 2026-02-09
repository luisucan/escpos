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
      text: 'Tienda "La Abejita Feliz año á"',
      align: 'center',
    },/*
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
    /*{
      barcodeContent: '123456789012',
      type: 'EAN13',
      height: 80,
      width: 2,
      textPosition: 'below',
      align: 'center',
    },*/
    /*{
      qrContent: 'https://example.com/qr-code'
    }*/
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('\u2705 Print job completed');
})();
