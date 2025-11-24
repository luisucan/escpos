# Pruebas Unitarias

Este directorio contiene las pruebas unitarias para la biblioteca ESC/POS.

## Estructura de Pruebas

- `escpos-commands.test.ts` - Pruebas para la clase `EscPosCommands`
- `escpos-printer.test.ts` - Pruebas para la clase `EscPosPrinter`

## Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage
```

## Cobertura de Pruebas

Las pruebas cubren:

### EscPosCommands
- ✓ Caracteres de control (ESC, GS, FS, LF, CR)
- ✓ Inicialización de impresora
- ✓ Saltos de línea
- ✓ Corte de papel
- ✓ Alineación de texto
- ✓ Texto en negrita
- ✓ Tamaño de texto
- ✓ Impresión de texto

### EscPosPrinter
- ✓ Constructor e inicialización
- ✓ Métodos de impresión de texto
- ✓ Control de saltos de línea
- ✓ Alineación de texto
- ✓ Formato de texto (negrita, tamaño)
- ✓ Corte de papel
- ✓ Gestión del buffer
- ✓ Impresión a streams
- ✓ Encadenamiento de métodos
- ✓ Pruebas de integración (recibos completos)

## Cobertura Actual

- Statements: ~97%
- Branches: ~94%
- Functions: ~100%
- Lines: ~100%
