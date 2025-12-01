import { EscPosCommands } from '../EscPosCommands';
import { EscPosImage, EscPosPage, EscPosQrCode, EscPosText } from './EscPosPage';

import Jimp from 'jimp';

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

  private addQrCode(qr: EscPosQrCode): void {
    // Set alignment (default center)
    const alignment = qr.alignment || 'center';
    this.esc_pos.push(EscPosCommands.align(alignment));
    
    // Set QR code model (Model 2)
    this.esc_pos.push(EscPosCommands.qrCodeModel());
    
    // Set QR code size (default 8, range 1-16)
    const size = qr.size || 8;
    this.esc_pos.push(EscPosCommands.qrCodeSize(size));
    
    // Set error correction level (default M)
    const errorLevel = qr.errorLevel || 'M';
    this.esc_pos.push(EscPosCommands.qrCodeErrorLevel(errorLevel));
    
    // Store QR code data
    this.esc_pos.push(EscPosCommands.qrCodeData(qr.qrContent));
    
    // Print the QR code
    this.esc_pos.push(EscPosCommands.qrCodePrint());
    
    // Reset alignment to left after QR code
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
        this.addQrCode(item);
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
