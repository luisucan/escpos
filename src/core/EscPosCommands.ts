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
}