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
  codeTable: 16,      // tabla que envías a la impresora (ajusta según tu modelo)
  encoding: 'cp1252', // encoding real del texto — cp850 o cp1252 soportan á é í ó ú
  content: [
    {
          "index": "forma_pago",
          "align": "right",
          "text": ">>> á é í ó ú Á É Í Ó Ú ñ Ñ ü"
    },
    {
      section: [
        {
          "index": "forma_pago",
          "align": "right",
          "text": "Forma Pago: $ {{forma_pago}}"
        },
        {
          "index": "recibe_monto",
          "align": "right",
          "text": "Recibe: $ {{recibe_monto}}"
        },
        {
          "index": "cambio_monto",
          "align": "right",
          "text": "Cambio: $ {{cambio_monto}}"
        },
      ]
    },
    {
          "index": "forma_pago",
          "align": "right",
          "text": "á é í ó ú Á É Í Ó Ú ñ Ñ ü"
    },
    /*{
      barcodeContent: 'COT POKEA 0001',
      type: 'CODE128',
      align: 'center',
      height: 80,
      textPosition: 'below',
    }*/
    /*,{
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
