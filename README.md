# ESC/POS Thermal Printer Library

Libreria en TypeScript para generar y enviar comandos ESC/POS a impresoras termicas.

## Instalacion

```bash
npm install escpos
```

## Uso rapido

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [
    { text: 'Hola mundo', align: 'center', bold: true },
    { charLine: '-' },
    { text: 'Gracias por su compra' },
  ],
};

(async () => {
  await printer.print(page);
})();
```

## Uso en macOS (CUPS)

Esta libreria usa `lp -o raw` para enviar bytes ESC/POS.

1. Lista impresoras instaladas:

```bash
lpstat -p
```

2. Usa el nombre exacto en `page.printer`.

Ejemplo rapido (macOS):

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [{ text: 'Ticket macOS', bold: true }, { charLine: '-' }, { text: 'CUPS RAW OK' }],
};

(async () => {
  const printers = await printer.getListPrinters();
  console.log(
    'Disponibles:',
    printers.map((p) => p.name)
  );
  await printer.print(page);
})();
```

## Uso en Windows

La implementacion usa PowerShell para enviar RAW al spooler.

1. Lista impresoras:

```powershell
Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name
```

Fallback (equipos viejos):

```powershell
wmic printer get name
```

## Uso en Linux

Por el momento **no esta probado en Linux**. La libreria esta enfocada en impresion
por interfaz **USB** y los adaptadores para red/serial no estan soportados aun.

Nota: Linux normalmente usa CUPS (como macOS), pero esta libreria no ha sido
validada en distribuciones Linux. Si decides probarlo, usa los nombres de impresora
de `lpstat -p` y considera que el soporte es experimental.

Ejemplo rapido (Windows):

```ts
import { EscPosPage, EscPosPrinterType, printer } from 'escpos';

const page: EscPosPage = {
  printer: 'POS-80C',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [
    { text: 'Ticket de prueba', bold: true },
    { charLine: '-' },
    { text: 'Impresion RAW OK' },
  ],
};

(async () => {
  const printers = await printer.getListPrinters();
  console.log(
    'Disponibles:',
    printers.map((p) => p.name)
  );
  await printer.print(page);
})();
```

## Estructura de una pagina (`EscPosPage`)

- `printer`: string, nombre de la impresora (CUPS o Windows).
- `printerType`: `USB | NETWORK | SERIAL`.
- `paperSize`: `58 | 80` (mm).
- `codeTable`: number (opcional). Default `0` (CP437).
- `content`: array de elementos a imprimir (ver abajo).

## Elementos disponibles en `content`

### Texto (`EscPosText`)

Imprime texto plano.

Propiedades:

- `text` (string): contenido.
- `bold` (boolean): negritas.
- `size` ({ width, height }): escala de 1 a 8.
- `align` ('left' | 'center' | 'right').

### Imagen (`EscPosImage`)

Convierte una imagen a ESC/POS raster.

Propiedades:

- `src` (string): ruta local o URL.
- `type` ('local' | 'url').
- `threshold` (number): 0-255, menor valor = mas oscuro.

### QR (`EscPosQrCode`)

Genera un QR como imagen e imprime.

Propiedades:

- `qrContent` (string): texto o URL.
- `alignment` ('left' | 'center' | 'right').
- `size` (number): escala (default 8).
- `errorLevel` ('L' | 'M' | 'Q' | 'H').

### Codigo de barras (`EscPosBarcode`)

Genera un barcode con `bwip-js` y lo imprime como imagen.

Propiedades:

- `barcodeContent` (string): datos.
- `type` ('UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128').
- `height` (number): altura en puntos (default 162).
- `width` (number): ancho relativo (default 3).
- `textPosition` ('none' | 'above' | 'below' | 'both').
- `align` ('left' | 'center' | 'right').

### Linea separadora (`EscPosLineBreak`)

Imprime una o varias lineas con un caracter repetido.

Propiedades:

- `lines` (number): numero de lineas.
- `charLine` (string): caracter a repetir.

### Corte (`EscPostCut`)

Corta el papel con ESC/POS.

Propiedades:

- `cut` (boolean): true para cortar.
- `feedLines` (number): lineas antes del corte (si aplica).

### Abrir gaveta (`EscPosOpenDrawer`)

Envía el comando para abrir gaveta.

Propiedades:

- `openDrawer` (boolean).

### Tabla (`EscPosTable`)

Imprime filas con columnas alineadas.

Propiedades:

- `header` (EscPosTableCell[]): cabecera opcional.
- `headerBold` (boolean): fuerza negritas en el header.
- `rows` (EscPosTableCell[][]): filas.
- `columnWidths` (number[]): porcentajes por columna, se normalizan automaticamente.
- `lineChar` (string): caracter del separador (default `-`).
- `align` ('left' | 'center' | 'right'): alineacion default.
- `rowSpacing` (number): lineas en blanco entre filas (default 1).
- `footerLine` (boolean): linea final para cerrar la tabla (default true).

`EscPosTableCell`:

- `text` (string)
- `align` ('left' | 'center' | 'right')
- `bold` (boolean)

## Ejemplo de tabla

```ts
import { EscPosPage, EscPosPrinterType, EscPosTable, printer } from 'escpos';

const table: EscPosTable = {
  header: [
    { text: 'Producto', align: 'left' },
    { text: 'Cant', align: 'center' },
    { text: 'Precio', align: 'right' },
  ],
  headerBold: true,
  columnWidths: [60, 20, 20],
  lineChar: '-',
  rowSpacing: 1,
  footerLine: true,
  rows: [
    [
      { text: 'Coca-Cola 500ml', align: 'left' },
      { text: '2', align: 'center' },
      { text: '$20.00', align: 'right' },
    ],
  ],
};

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,
  content: [table],
};

(async () => {
  await printer.print(page);
})();
```

## Notas

- `printer` debe coincidir con el nombre del sistema (CUPS o Windows).
- En imagenes puedes ajustar `threshold` para oscurecer o aclarar.
- QR y barcode usan imagenes raster; si fallan, se imprime texto de respaldo.

## Troubleshooting

- Texto con caracteres raros: ajusta `codeTable` segun la pagina de codigos de tu impresora.
- Impresion muy clara: baja `threshold` en imagenes o usa `bold` en texto.
- No imprime en Windows: confirma que el nombre de la impresora coincide y que PowerShell esta disponible.
- No imprime en macOS/Linux: confirma `lpstat -p` y que CUPS este activo.
- En Windows, si PowerShell bloquea la ejecucion, abre una consola como administrador y permite scripts con:
  `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Para evitar cambiar la policy global, puedes ejecutar la app con:
  `powershell -ExecutionPolicy Bypass -File tu-script.ps1`
- Para revertir la policy del usuario actual:
  `Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser`
- Nota de seguridad: evita usar `Bypass` en produccion salvo que conozcas el impacto.

## Desarrollo

```bash
npm run lint
npm run format
npm test
```

## Licencia

MIT
