# ESC/POS Thermal Printer (macOS / Windows / Linux)

Libreria TypeScript para generar comandos ESC/POS e imprimir en impresoras termicas usando el spooler del sistema.

Funciona asi:

- Tu defines un `EscPosPage` (texto, imagen, QR, barcode, cortes, etc.).
- `EscPosPageBuilder` lo convierte a un `Buffer` ESC/POS.
- El driver por OS envia el buffer en modo RAW.

## Instalacion

```bash
npm i @luisvillafania/escpos
```

## Ejemplo rapido (Windows / macOS / Linux)

```ts
import { EscPosPrinterType, type EscPosPage, printer } from '@luisvillafania/escpos';

const page: EscPosPage = {
  printer: 'POS-80C',
  printerType: EscPosPrinterType.USB,
  paperSize: 80,

  // Opcional: tabla de caracteres (ESC t n). Default: 0 (CP437)
  // Si tu firmware usa otra tabla, prueba con 2 (CP850)
  codeTable: 0,

  content: [
    { text: 'Tienda "La Abejita Feliz"', align: 'center' },
    { text: 'Prueba: ÁÉÍÓÚ áéíóú Ññ Üü', align: 'center' },
    { charLine: '=' },
    { text: 'Gracias por su compra' },
    { cut: true },
  ],
};

(async () => {
  await printer.print(page);
  console.log('Print job completed');
})();
```

## Listar impresoras instaladas

Con la libreria:

```ts
import { printer } from '@luisvillafania/escpos';

(async () => {
  const printers = await printer.getListPrinters();
  console.log(printers);
})();
```

Desde el sistema:

- macOS/Linux (CUPS): `lpstat -p`
- Windows (PowerShell): `Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name`

## Windows

### Requisitos

- Windows 10/11
- Servicio "Print Spooler" habilitado
- PowerShell disponible

### Como imprime en Windows

La implementacion `EscPosPrinterWindowsOs` manda el buffer ESC/POS como RAW al spooler usando Win32 (`OpenPrinter/StartDocPrinter/WritePrinter`) desde PowerShell.

Recomendaciones:

- Para impresoras ESC/POS, suele funcionar mejor un driver tipo `Generic / Text Only` o un driver ESC/POS que soporte RAW.
- Si ves "letras" al imprimir una imagen, normalmente es porque el driver esta renderizando o el comando de imagen no coincide con el modo esperado.

## macOS / Linux (CUPS)

### Requisitos

- CUPS disponible
- Impresora instalada en el sistema

Activar interfaz web en macOS (opcional):

```bash
cupsctl WebInterface=yes
```

### Como imprime en macOS / Linux

La implementacion `EscPosPrinterMacOs` usa `lp -o raw -d "<printer>"` y envia el `Buffer` por stdin.

## Acentos y caracteres especiales

Por defecto, el texto se codifica en `CP437` (1 byte por caracter) y el builder envia `ESC t 0` al inicio.

Si tu firmware no corresponde a CP437, cambia `codeTable`:

- `codeTable: 2` suele ser `CP850` (comun en ES/LatAm)

## Estructura de `content`

`content` acepta una lista de elementos. Los mas usados:

- Texto: `text`, `align`, `bold`, `size`
- Imagen: `src`, `type`, `threshold`
- QR: `qrContent`, `size`, `errorLevel`, `alignment`
- Linea: `charLine`, `lines`
- Codigo de barras: `barcodeContent`, `type`, `height`, `width`, `textPosition`, `align`
- Corte / feed: `cut`, `feedLines`
- Cajon: `openDrawer`

## Clases involucradas (arquitectura)

- `EscPosFactory`
  - Detecta el OS (`process.platform`) y crea el printer correspondiente.
- `EscPosPrinterImpl`
  - Base para impresoras; define la API (`print`, `getListPrinters`) y helpers de buffer.
- `EscPosPrinterMacOs`
  - Driver CUPS: `lp` para imprimir y `lpstat` para listar impresoras.
- `EscPosPrinterWindowsOs`
  - Driver Windows: lista con PowerShell/WMI y imprime RAW via Win32 spooler.
- `EscPosPageBuilder`
  - Convierte un `EscPosPage` (lista de items) a un `Buffer` ESC/POS (imagenes, texto, QR, barcode, cortes).
- `EscPosCommands`
  - Primitivas ESC/POS (initialize, align, bold, image header, QR/barcode, select code table, etc.).

## Desarrollo

```bash
npm run lint
npm run format
npm run build
```

## Licencia

MIT
