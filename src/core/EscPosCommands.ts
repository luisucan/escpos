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

  // Print and feed paper (forces buffer to print)
  static printAndFeed(lines: number = 0): Buffer {
    return Buffer.from(`${this.ESC}d${String.fromCharCode(lines)}`);
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

  static reset(): Buffer {
    return Buffer.from([0x1B, 0x40]);
  }

  // Print raster bit image
  static printImage(width: number, height: number): Buffer {
    const widthLow = (width / 8) & 0xff;
    const widthHigh = ((width / 8) >> 8) & 0xff;
    const heightLow = height & 0xff;
    const heightHigh = (height >> 8) & 0xff;
    return Buffer.from([0x1D, 0x76, 0x30, 0x00, widthLow, widthHigh, heightLow, heightHigh]);
  }

  // QR Code commands
  static qrCodeModel(): Buffer {
    // Set QR code model
    return Buffer.from([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);
  }

  static qrCodeSize(size: number = 8): Buffer {
    // Set QR code size (1-16)
    return Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size]);
  }

  static qrCodeErrorLevel(level: 'L' | 'M' | 'Q' | 'H' = 'M'): Buffer {
    // Set error correction level
    const errorLevels = { L: 0x30, M: 0x31, Q: 0x32, H: 0x33 };
    return Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, errorLevels[level]]);
  }

  static qrCodeData(data: string): Buffer {
    // Store QR code data
    const dataLength = data.length + 3;
    const pL = dataLength & 0xff;
    const pH = (dataLength >> 8) & 0xff;
    const header = Buffer.from([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]);
    const content = Buffer.from(data, 'utf8');
    return Buffer.concat([header, content]);
  }

  static qrCodePrint(): Buffer {
    // Print stored QR code
    return Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]);
  }
}