/**
 * Test multiple consecutive prints
 */

import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const testPrint = (number: number) => {
  const page = {
    printer: 'Printer_POS_80',
    printerType: 'USB',
    paperSize: '80',
    content: [
      {
        text: `=== PRUEBA DE IMPRESION #${number} ===\n`,
      },
      {
        text: `Fecha: ${new Date().toLocaleString()}\n`,
      },
      {
        text: 'Esta es una prueba de impresion consecutiva.\n',
      },
      {
        text: '\n',
      },
    ],
  } as EscPosPage;

  console.log(`\n🖨️  Enviando impresión #${number}...`);
  printer.print(page);
};

// Realizar 3 impresiones con delay
console.log('Iniciando prueba de impresiones múltiples...\n');

testPrint(1);

setTimeout(() => {
  testPrint(2);
}, 3000);

setTimeout(() => {
  testPrint(3);
  console.log('\n✅ Todas las impresiones enviadas. Verifica tu impresora física.\n');
}, 6000);
