/**
 * Test QR code generation as image
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: 80,
  content: [
    {
      text: '=== PRUEBA DE CODIGO QR ===\n',
    },
    {
      text: '\nEscanea el codigo QR:\n',
    },
    {
      qrContent: 'https://www.github.com',
      size: 6,
      errorLevel: 'M',
      alignment: 'center',
    },
    {
      text: '\nQR pequeño (size 4):\n',
    },
    {
      qrContent: 'Texto de prueba',
      size: 4,
      errorLevel: 'L',
      alignment: 'center',
    },
    {
      text: '\nQR grande (size 8):\n',
    },
    {
      qrContent: 'https://www.ejemplo.com/ticket/12345',
      size: 8,
      errorLevel: 'H',
      alignment: 'center',
    },
    {
      text: '\n--- Fin de prueba ---\n',
    },
  ],
} as EscPosPage;

(async () => {
  await printer.print(page);
  console.log('✅ QR code test completed');
})();
