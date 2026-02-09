# ESC/POS Thermal Printer (macOS)

Documentacion rapida para imprimir en macOS usando esta libreria.

## Requisitos

- macOS con CUPS disponible.
- Impresora instalada en el sistema (nombre visible en CUPS).
- Node.js >= 14.

# Activar cups en mac

cupsctl WebInterface=yes

## Instalacion

```bash
npm install @luisvillafania/escpos
```

## Ejemplo rapido (macOS USB)

Este ejemplo esta basado en `print.ts` y usa el printer por defecto que crea
`EscPosFactory.createMacOsUsbPrinter()`.

```ts
import { EscPosPage } from './src/core/page/EscPosPage';
import { printer } from './src/index';

const page = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: 80,

  // Opcional: tabla de caracteres (ESC t n). Default: 0 (CP437)
  // Si tu firmware usa otra tabla, prueba con 2 (CP850)
  codeTable: 0,

  content: [
    {
      src: './src/assets/img/logo_empresa.png',
    },
    {
      text: 'Tienda "La Abejita Feliz"',
      align: 'center',
    },
    {
      text: 'RFC: ABCD800101XYZ',
      align: 'center',
    },
    {
      text: 'Calle: conocido',
      align: 'center',
    },
    {
      text: 'Tel: 9991107140',
      align: 'center',
    },
    {
      charLine: '=',
    },
    {
      charLine: '*',
    },
    {
      qrContent: 'https://example.com/qr-code',
    },
  ],
};

(async () => {
  await printer.print(page);
  console.log('Print job completed');
})();
```

## Como ejecutar

### Opcion A: compilar y ejecutar

```bash
npm run build
node dist/print.js
```

### Opcion B: ejecutar TypeScript directo

Instala `tsx` o `ts-node` y ejecuta:

```bash
npx tsx print.ts
```

## Como elegir la impresora

El campo `printer` debe coincidir con el nombre de la impresora en CUPS.

Para ver las impresoras instaladas:

```bash
lpstat -p
```

Usa ese nombre exacto en `page.printer`.

## Estructura del contenido

`content` acepta una lista de elementos. Los mas usados:

- Texto:
  - `text`, `align`, `bold`, `size`
- Imagen:
  - `src` (local o URL)
- QR:
  - `qrContent`, `size`, `errorLevel`, `alignment`
- Linea:
  - `charLine`, `lines`
- Codigo de barras:
  - `barcodeContent`, `type`, `height`, `width`, `textPosition`, `align`

## Notas

- La impresion en macOS se hace via `lp` con `-o raw`.
- Si el QR o el codigo de barras fallan, se imprime texto de respaldo.
- La libreria usa `Jimp`, `qrcode` y `bwip-js` para generar imagenes.

## Desarrollo

```bash
npm run lint
npm run format
npm test
```

## Tareas específicas de prueba

- Ejecuta un solo archivo con `npm run test -- src/__tests__/archivo.test.ts`.
- Añade `-t "subprueba"` al final para filtrar un caso específico.
- Usa `npm run test -- --runInBand` si sospechas interferencias entre tests.

## Licencia

- MIT
