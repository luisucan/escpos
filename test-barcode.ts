/**
 * Test barcode printing
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: 80,
  content: [
    {
      text: '=== PRUEBA DE CODIGOS DE BARRAS ===\n',
    },
    {
      text: '\nEAN13 (codigo valido):\n',
    },
    {
      barcodeContent: '5901234123457',
      type: 'EAN13',
      height: 100,
      width: 3,
      textPosition: 'below',
      align: 'center',
    },
    {
      text: '\nCODE128 (alfanumerico):\n',
    },
    {
      barcodeContent: 'ABC123',
      type: 'CODE128',
      height: 100,
      width: 3,
      textPosition: 'below',
      align: 'center',
    },
    {
      text: '\nCODE39:\n',
    },
    {
      barcodeContent: '123ABC',
      type: 'CODE39',
      height: 100,
      width: 3,
      textPosition: 'below',
      align: 'center',
    },
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('✅ Barcode test completed');
})();
