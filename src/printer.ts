/**
 * ESC/POS Commands
 * Standard commands for thermal printer communication
 */
export class EscPosCommands {
  // ESC/POS Control Characters
  static readonly ESC = '\x1B';
  static readonly GS = '\x1D';
  static readonly FS = '\x1C';
  static readonly LF = '\x0A';
  static readonly CR = '\x0D';

  // Initialize printer
  static initialize(): Buffer {
    return Buffer.from(`${this.ESC}@`);
  }

  // Line feed
  static lineFeed(lines: number = 1): Buffer {
    return Buffer.from(this.LF.repeat(lines));
  }

  // Cut paper
  static cut(partial: boolean = false): Buffer {
    const cutType = partial ? '\x01' : '\x00';
    return Buffer.from(`${this.GS}V${cutType}`);
  }

  // Set text alignment
  static align(alignment: 'left' | 'center' | 'right'): Buffer {
    const alignMap = { left: '\x00', center: '\x01', right: '\x02' };
    return Buffer.from(`${this.ESC}a${alignMap[alignment]}`);
  }

  // Set text style
  static bold(enabled: boolean = true): Buffer {
    const value = enabled ? '\x01' : '\x00';
    return Buffer.from(`${this.ESC}E${value}`);
  }

  // Set text size
  static textSize(width: number = 1, height: number = 1): Buffer {
    const size = ((width - 1) << 4) | (height - 1);
    return Buffer.from(`${this.GS}!${String.fromCharCode(size)}`);
  }

  // Print text
  static text(content: string): Buffer {
    return Buffer.from(content);
  }
}

/**
 * ESC/POS Printer Interface
 * Main class for interacting with thermal printers
 */
export class EscPosPrinter {
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
  async print(stream?: NodeJS.WritableStream): Promise<Buffer> {
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
  }
}
