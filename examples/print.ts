/**
 * Manual testing file for ESC/POS printer library
 * Use this file to test your printer implementation
 */

import { EscPosPage } from '../src/core/page/EscPosPage';
import { printer } from '../src/index';

const page = {
  printer: 'PrinterCMD_ESCPO_POS80_Printer_USB',
  printerType: 'USB',
  paperSize: 80,
  content: [
    {
      src: './src/assets/img/logo_empresa.png',
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
    },
    {
      header: [
        { text: 'Producto', align: 'left' },
        { text: 'Cant', align: 'center' },
        { text: 'Precio', align: 'right' },
      ],
      columnWidths: [60, 20, 20],
      lineChar: '-',
      rows: [
        [
          { text: 'Coca-Cola 500ml que fue comprada en la tienda el año pasado por avión', align: 'left' },
          { text: '2', align: 'center' },
          { text: '$20.00', align: 'right' },
        ],
        [
          { text: 'Pan dulce', align: 'left' },
          { text: '3', align: 'center' },
          { text: '$15.00', align: 'right' },
        ],
        [
          {
            text: 'Café con leche la lechera sin azúcar procesada por las empresas grandes del mundo',
            align: 'left',
          },
          { text: '1', align: 'center' },
          { text: '$10.00', align: 'right' },
        ],
      ],
    },
    {
      barcodeContent: '123456789012',
      type: 'EAN13',
      height: 80,
      width: 2,
      textPosition: 'below',
      align: 'center',
    },
    {
      qrContent: 'https://example.com/qr-code',
    },
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('\u2705 Print job completed');
})();
