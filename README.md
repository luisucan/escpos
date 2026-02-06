# ESC/POS Thermal Printer · macOS (Windows/Linux próximamente)

Guía de referencia para usar la librería `@luisvillafania/escpos`. Hoy soporta macOS con CUPS; Linux y Windows se añadirán próximamente con instrucciones propias.

## Qué hace esta librería

- Envía trabajos ESC/POS a impresoras térmicas desde Node.js/TypeScript.
- Genera texto, imágenes, códigos QR y de barras mediante helpers (`Jimp`, `qrcode`, `bwip-js`).
- Sobre macOS usa CUPS + `lp -o raw` para mandar bytes tal como la impresora los espera.

## Instalación

```bash
npm install @luisvillafania/escpos
```

## Flujo de uso genérico

1. Define una página con `EscPosPage`: nombre de impresora, tipo, tamaño de papel y contenido.
2. Usa `printer.print(page)` desde `@luisvillafania/escpos` para generar y enviar el trabajo.
3. Para desarrollo rápido ejecuta el archivo TypeScript con `tsx` o compila con `npm run build`.

## Instrucciones específicas por sistema

### macOS (actualmente soportado)

- macOS debe tener CUPS activo: `sudo cupsctl WebInterface=yes` habilita la interfaz web y el servicio.
- Instala la impresora en Preferencias → Impresoras y asegúrate de que aparece en `lpstat -p`.
- El nombre que aparece en CUPS debe usarse como `page.printer`.
- El driver recibe `lp -o raw` para evitar transformaciones de contenido.
- Si necesitas un ejemplo completo, revisa `src/print.ts` y la fábrica `EscPosFactory.createMacOsUsbPrinter()`.

### Linux (próximamente)

- Planeamos reutilizar CUPS y los mismos helpers; documentaremos dependencias específicas (drivers, permisos) cuando liberemos soporte.

### Windows (próximamente)

- Estamos analizando impresoras locales vs USB; mientras tanto puedes revisar `lp`/`printer` equivalents.

## Ejemplo rápido (macOS USB)

```ts
import { EscPosPage } from '@luisvillafania/escpos';
import { printer } from '@luisvillafania/escpos';

const page: EscPosPage = {
  printer: 'Printer_POS_80',
  printerType: 'USB',
  paperSize: 80,
  content: [
    { src: './assets/logo_empresa.png' },
    { text: 'Tienda "La Abejita Feliz"', align: 'center' },
    { text: 'RFC: ABCD800101XYZ', align: 'center' },
    { text: 'Calle: Conocido', align: 'center' },
    { text: 'Tel: 9991107140', align: 'center' },
    { charLine: '=' },
    { charLine: '*' },
    { qrContent: 'https://example.com/qr-code' },
  ],
};

(async () => {
  await printer.print(page);
  console.log('✅ Print job completed');
})();
```

## Cómo ejecutar

- **Opción A – compilar y ejecutar:** `npm run build` y luego `node dist/print.js`.
- **Opción B – ejecutar TS directo:** instala `tsx` o `ts-node` y corre `npx tsx print.ts`.
- Para pruebas rápidas puedes añadir `-t "nombre del test"` a `npm run test -- src/__tests__/...`.

## Selección de impresora y contenido

- Lista impresoras instaladas con `lpstat -p` y copia el nombre exacto en `page.printer`.
- `content` acepta elementos ordenados:
  - Texto: `{ text, align, bold?, size? }`
  - Imagen: `{ src }` acepta rutas locales o URLs.
  - QR: `{ qrContent, size?, errorLevel?, align? }`
  - Línea: `{ charLine, lines? }` para páginas separadas.
  - Código de barras: `{ barcodeContent, type, height?, width?, textPosition?, align? }`
- Si falla un QR o código, se imprime texto de respaldo.

## Notas adicionales

- El trabajo se envía con `lp -o raw` para preservar el control de comandos ESC/POS.
- Las imágenes se renderizan con `Jimp`, los QR con `qrcode` y los códigos de barras con `bwip-js`.
- Guarda recursos (logos, pictogramas) dentro del proyecto para evitar depender de rutas absolutas.

## Desarrollo

```bash
npm run lint
npm run format
npm run test
```

## Tareas específicas de prueba

- Ejecuta un solo archivo con `npm run test -- src/__tests__/archivo.test.ts`.
- Añade `-t "subprueba"` al final para filtrar un caso específico.
- Usa `npm run test -- --runInBand` si sospechas interferencias entre tests.

## Licencia

- MIT
