import { EscPosCommands } from '../EscPosCommands';
import { EscPosImage, EscPosPage, EscPosText } from './EscPosPage';

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
