import { EscPosCommands } from '../EscPosCommands';
import { EscPosBarcode, EscPosImage, EscPosPage, EscPosQrCode, EscPosText } from './EscPosPage';

import Jimp from 'jimp';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export class EscPosPageBuilder {
  private MAX_WIDTH;
  private esc_pos: Buffer[];

  private constructor(page: EscPosPage) {
    this.esc_pos = [];
    this.MAX_WIDTH = page.paperSize === 80 ? 576 : 384;
  }

  private async addImage(itemImg: EscPosImage): Promise<void> {
    let img: Jimp;

    img = await Jimp.read(itemImg.src as string);

    img.resize(this.MAX_WIDTH, Jimp.AUTO);
    img.grayscale().contrast(1);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Add image header command
    this.esc_pos.push(EscPosCommands.printImage(width, height));

    const bytesPerLine = width / 8;
    const imageData: number[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < bytesPerLine; x++) {
        let byte = 0;

        for (let b = 0; b < 8; b++) {
          const pixel = Jimp.intToRGBA(img.getPixelColor(x * 8 + b, y));
          const lum = (pixel.r + pixel.g + pixel.b) / 3;

          byte = (byte << 1) | (lum < 128 ? 1 : 0);
        }

        imageData.push(byte);
      }
    }

    // Add the image data as a buffer
    this.esc_pos.push(Buffer.from(imageData));

    // No feed after image - let content flow immediately
  }

  private async addQrCode(qr: EscPosQrCode): Promise<void> {
    // Set alignment (default center)
    const alignment = qr.alignment || 'center';
    this.esc_pos.push(EscPosCommands.align(alignment));
    
    try {
      // Generate QR code as image buffer
      const size = (qr.size || 8) * 32; // Convert size to pixels
      const qrImageBuffer = await QRCode.toBuffer(qr.qrContent, {
        width: size,
        margin: 1,
        errorCorrectionLevel: qr.errorLevel || 'M',
        type: 'png',
      });
      
      // Load QR image with Jimp
      const img = await Jimp.read(qrImageBuffer);
      
      // Ensure it fits the paper width
      if (img.bitmap.width > this.MAX_WIDTH) {
        img.resize(this.MAX_WIDTH, Jimp.AUTO);
      }
      
      img.grayscale();
      
      const width = img.bitmap.width;
      const height = img.bitmap.height;
      
      // Add image header command
      this.esc_pos.push(EscPosCommands.printImage(width, height));
      
      const bytesPerLine = width / 8;
      const imageData: number[] = [];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
          let byte = 0;
      
          for (let b = 0; b < 8; b++) {
            const pixel = Jimp.intToRGBA(img.getPixelColor(x * 8 + b, y));
            const lum = (pixel.r + pixel.g + pixel.b) / 3;
      
            byte = (byte << 1) | (lum < 128 ? 1 : 0);
          }
      
          imageData.push(byte);
        }
      }
      
      // Add the image data as a buffer
      this.esc_pos.push(Buffer.from(imageData));
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback: print QR content as text if image generation fails
      this.esc_pos.push(EscPosCommands.text(`QR: ${qr.qrContent}\n`));
    }
    
    // Reset alignment to left after QR code
    this.esc_pos.push(EscPosCommands.align('left'));
  }

  private async addBarcode(itemBarcode: EscPosBarcode): Promise<void> {
    // Set alignment (default center)
    const alignment = itemBarcode.align || 'center';
    this.esc_pos.push(EscPosCommands.align(alignment));

    try {
      // Map barcode types to bwip-js symbology names
      const barcodeTypeMap: { [key: string]: string } = {
        'UPC-A': 'upca',
        'UPC-E': 'upce',
        'EAN13': 'ean13',
        'EAN8': 'ean8',
        'CODE39': 'code39',
        'ITF': 'interleaved2of5',
        'CODABAR': 'codabar',
        'CODE93': 'code93',
        'CODE128': 'code128',
      };

      const barcodeType = barcodeTypeMap[itemBarcode.type] || 'code128';
      const height = itemBarcode.height || 162;
      const width = itemBarcode.width || 3;

      // Generate barcode as PNG buffer
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: barcodeType,
        text: itemBarcode.barcodeContent,
        scale: width,
        height: Math.floor(height / 10), // Convert dots to mm approximation
        includetext: itemBarcode.textPosition !== 'none',
        textxalign: 'center',
      });

      // Load barcode image with Jimp
      const img = await Jimp.read(barcodeBuffer);

      // Ensure it fits the paper width
      if (img.bitmap.width > this.MAX_WIDTH) {
        img.resize(this.MAX_WIDTH, Jimp.AUTO);
      }

      img.grayscale();

      const imgWidth = img.bitmap.width;
      const imgHeight = img.bitmap.height;

      // Add image header command
      this.esc_pos.push(EscPosCommands.printImage(imgWidth, imgHeight));

      const bytesPerLine = imgWidth / 8;
      const imageData: number[] = [];

      for (let y = 0; y < imgHeight; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
          let byte = 0;

          for (let b = 0; b < 8; b++) {
            const pixel = Jimp.intToRGBA(img.getPixelColor(x * 8 + b, y));
            const lum = (pixel.r + pixel.g + pixel.b) / 3;

            // Inverted logic: white (255) = 0, black (0) = 1
            byte = (byte << 1) | (lum > 128 ? 0 : 1);
          }

          imageData.push(byte);
        }
      }

      // Add the image data as a buffer
      this.esc_pos.push(Buffer.from(imageData));

      // Add line feed after barcode
      this.esc_pos.push(EscPosCommands.lineFeed(1));
    } catch (error) {
      console.error('Error generating barcode:', error);
      // Fallback: print barcode content as text if image generation fails
      this.esc_pos.push(EscPosCommands.text(`Barcode: ${itemBarcode.barcodeContent}\n`));
    }

    // Reset alignment to left after barcode
    this.esc_pos.push(EscPosCommands.align('left'));
  }

  private addText(itemText: EscPosText): void {
    this.esc_pos.push(EscPosCommands.text(itemText.text));
    // Remove extra line feed to reduce spacing
  }

  private async initialize(page: EscPosPage): Promise<void> {
    // No initialize command to avoid spacing at the start

    // Initialize ESC/POS commands
    for (const item of page.content) {
      // Process each item in the page content
      // For example, handle text, images, etc.
      if ('text' in item) {
        this.addText(item);
      }

      if ('src' in item) {
        await this.addImage(item);
      }

      if ('qrContent' in item) {
        await this.addQrCode(item);
      }

      if ('barcodeContent' in item) {
        await this.addBarcode(item);
      }
    }

    // Reduce feed before cutting from 5 to 2 lines
    this.esc_pos.push(EscPosCommands.printAndFeed(5));
    this.esc_pos.push(EscPosCommands.cut());
  }

  static async build(page: EscPosPage): Promise<Buffer> {
    const builder = new EscPosPageBuilder(page);
    await builder.initialize(page);

    const buffer = Buffer.concat(builder.esc_pos);
    return buffer;
  }
}
