const fs = require("fs");
const Jimp = require("jimp");

// Ruta impresora USB en Linux
const path = "/dev/usb/lp0";
const printer = fs.createWriteStream(path);

/* ================================
   CONFIGURACIÓN GENERAL
================================ */

const PAPER_WIDTH = 80; // 58 o 80
const MAX_WIDTH = PAPER_WIDTH === 80 ? 576 : 384;
const CHAR_WIDTH = PAPER_WIDTH === 80 ? 48 : 32;

const COL_QTY = 4;
const COL_NAME = PAPER_WIDTH === 80 ? 34 : 20;
const COL_PRICE = PAPER_WIDTH === 80 ? 10 : 8;

/* ================================
   HELPERS ESC/POS
================================ */

function esc(bytes) {
  printer.write(Buffer.from(bytes));
}

// Mapa de acentos → ASCII plano
const ACCENT_MAP = {
  "á":"a","à":"a","ä":"a","â":"a","ã":"a",
  "Á":"A","À":"A","Ä":"A","Â":"A","Ã":"A",
  "é":"e","è":"e","ë":"e","ê":"e",
  "É":"E","È":"E","Ë":"E","Ê":"E",
  "í":"i","ì":"i","ï":"i","î":"i",
  "Í":"I","Ì":"I","Ï":"I","Î":"I",
  "ó":"o","ò":"o","ö":"o","ô":"o","õ":"o",
  "Ó":"O","Ò":"O","Ö":"O","Ô":"O","Õ":"O",
  "ú":"u","ù":"u","ü":"u","û":"u",
  "Ú":"U","Ù":"U","Ü":"U","Û":"U",
  "ñ":"n","Ñ":"N",
  "¿":"?","¡":"!"
};

// función para limpiar acentos
function sanitize(text) {
  return text
    .split("")
    .map(ch => {
      if (ACCENT_MAP[ch]) return ACCENT_MAP[ch];
      if (ch.charCodeAt(0) <= 127) return ch;
      return "?";
    })
    .join("");
}

function print(text) {
  printer.write(Buffer.from(sanitize(text), "ascii"));
}

function col(text, size) {
  text = text.toString();
  if (text.length > size) return text.slice(0, size);
  return text.padEnd(size, " ");
}

function colRight(text, size) {
  text = text.toString();
  if (text.length > size) return text.slice(0, size);
  return text.padStart(size, " ");
}

function wrapText(text, width) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const w of words) {
    if ((line + w).length > width) {
      lines.push(line.trim());
      line = "";
    }
    line += w + " ";
  }

  if (line.trim()) lines.push(line.trim());
  return lines;
}

function printItem(qty, name, price) {
  const nameLines = wrapText(name, COL_NAME);

  print(
    col(qty, COL_QTY) +
    col(nameLines[0], COL_NAME) +
    colRight(`$${price.toFixed(2)}`, COL_PRICE) +
    "\n"
  );

  for (let i = 1; i < nameLines.length; i++) {
    print(
      col("", COL_QTY) +
      col(nameLines[i], COL_NAME) +
      col("", COL_PRICE) +
      "\n"
    );
  }
}

/* ================================
   IMPRIMIR IMAGEN (LOGO)
================================ */

async function printImage(imagePath) {
  // Cargar imagen (API clásica compatible)
  const img = await Jimp.read(imagePath);

  // Redimensionar al ancho máximo de la impresora (58mm = 384px, 80mm = 576px)
  img.resize(MAX_WIDTH, Jimp.AUTO);

  // Convertir a blanco y negro con buen contraste
  img.grayscale().contrast(1);

  const width = img.bitmap.width;
  const height = img.bitmap.height;

  // Comando ESC/POS para raster bitmap (GS v 0)
  esc([
    0x1D, 0x76, 0x30, 0x00,
    width / 8, 0x00,
    height & 0xFF, height >> 8
  ]);

  const bytesPerLine = width / 8;

  // Generar la matriz de bytes escpos
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < bytesPerLine; x++) {

      let byte = 0;

      for (let b = 0; b < 8; b++) {
        const pixel = Jimp.intToRGBA(img.getPixelColor(x * 8 + b, y));
        const luminance = (pixel.r + pixel.g + pixel.b) / 3;

        // Menos de 128 = píxel negro
        byte = (byte << 1) | (luminance < 128 ? 1 : 0);
      }

      printer.write(Buffer.from([byte]));
    }
  }

  // Avanza el papel después de la imagen
  esc([0x1B, 0x4A, 20]);
}





/* ================================
   IMPRIMIR QR
================================ */

function printQR(text) {
  text = sanitize(text);

  const len = text.length + 3;

  // Guardar datos del QR
  esc([0x1D, 0x28, 0x6B, len & 0xFF, len >> 8, 0x31, 0x50, 0x30]);
  print(text);

  // Nivel de error
  esc([0x1D, 0x28, 0x6B, 3, 0, 0x31, 0x45, 0x31]);

  // Tamaño módulo
  esc([0x1D, 0x28, 0x6B, 3, 0, 0x31, 0x43, 8]);

  // Imprimir QR
  esc([0x1D, 0x28, 0x6B, 3, 0, 0x31, 0x51, 0x30]);
}

/* ================================
   TICKET COMPLETO
================================ */

async function main() {
  // RESET
  esc([0x1B, 0x40]);

  // CENTER
  esc([0x1B, 0x61, 0x01]);

  // LOGO
  await printImage("assets/logo.jpeg");

  print("TIENDA VILLASOFT\n");
  print("RFC: ABCD800101XYZ\n");
  print("Calle 123, Merida, Yucatan\n");
  print("Tel: 999-888-7777\n\n");

  // LEFT
  esc([0x1B, 0x61, 0x00]);
  print("-".repeat(CHAR_WIDTH) + "\n");

  print("Ticket: 000345\n");
  print("Fecha: 20/11/2025 11:25 AM\n");
  print("Cajero: Luis Ucan\n");
  print("-".repeat(CHAR_WIDTH) + "\n");

  const items = [
    { qty: 1, name: "Coca Cola 600ml", price: 18 },
    { qty: 2, name: "Galletas Gamesa Emperador chocolate extra", price: 28 },
    { qty: 1, name: "Sabritas Adobadas 45g", price: 17 },
    { qty: 1, name: "Pan Bimbo Blanco sin azucar grande", price: 40 }
  ];

  items.forEach(i => printItem(i.qty, i.name, i.price));

  print("-".repeat(CHAR_WIDTH) + "\n");

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  print(col("SUBTOTAL:", CHAR_WIDTH - COL_PRICE) + colRight(`$${subtotal.toFixed(2)}`, COL_PRICE) + "\n");
  print(col("IVA 16%:", CHAR_WIDTH - COL_PRICE) + colRight(`$${iva.toFixed(2)}`, COL_PRICE) + "\n");

  // Bold
  esc([0x1B, 0x45, 1]);
  print(col("TOTAL:", CHAR_WIDTH - COL_PRICE) + colRight(`$${total.toFixed(2)}`, COL_PRICE) + "\n");
  esc([0x1B, 0x45, 0]);

  print("-".repeat(CHAR_WIDTH) + "\n");

  esc([0x1B, 0x61, 0x01]);
  print("!Gracias por su compra!\n");
  print("!Vuelva pronto!\n\n");

  /* ===== QR CODE ===== */
  printQR("https://www.google.com");
  
  print("\n\n\n\n\n\n");

  // CUT
  esc([0x1D, 0x56, 0x00]);

  printer.end();
}

main();
