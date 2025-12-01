import { EscPosCommands } from "./EscPosCommands";
import { EscPosPrinter } from "./EscPostPrinter";
import { EscPosPage } from "./page/EscPosPage";


/**
 * ESC/POS Printer Interface
 * Main class for interacting with thermal printers
 */
export abstract class EscPosPrinterImpl implements EscPosPrinter {
  private buffer: Buffer[] = [];

  /**
   * Initialize the printer
   */
  initialize(): this {
    this.buffer.push(EscPosCommands.initialize());
    return this;
  }

  /**
   * Print text
   */
  text(content: string): this {
    this.buffer.push(EscPosCommands.text(content));
    return this;
  }

  /**
   * Add line feed
   */
  feed(lines: number = 1): this {
    this.buffer.push(EscPosCommands.lineFeed(lines));
    return this;
  }

  /**
   * Set text alignment
   */
  align(alignment: 'left' | 'center' | 'right'): this {
    this.buffer.push(EscPosCommands.align(alignment));
    return this;
  }

  /**
   * Set bold text
   */
  bold(enabled: boolean = true): this {
    this.buffer.push(EscPosCommands.bold(enabled));
    return this;
  }

  /**
   * Set text size
   */
  size(width: number = 1, height: number = 1): this {
    this.buffer.push(EscPosCommands.textSize(width, height));
    return this;
  }

  /**
   * Cut the paper
   */
  cut(partial: boolean = false): this {
    this.buffer.push(EscPosCommands.cut(partial));
    return this;
  }

  /**
   * Get the print buffer
   */
  getBuffer(): Buffer {
    return Buffer.concat(this.buffer);
  }

  /**
   * Clear the buffer
   */
  clear(): this {
    this.buffer = [];
    return this;
  }

  /**
   * Print to a stream or get buffer
   */
  /*async print(stream?: NodeJS.WritableStream): Promise<Buffer> {
    const data = this.getBuffer();

    if (stream) {
      return new Promise((resolve, reject) => {
        stream.write(data, (err) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }

    return data;
  }*/

  abstract print(page: EscPosPage): Promise<void>;
}
