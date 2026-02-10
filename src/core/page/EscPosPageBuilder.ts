import { EscPosCommands } from '../EscPosCommands';
import {
  EscPosBarcode,
  EscPosImage,
  EscPosLineBreak,
  EscPosPage,
  EscPosQrCode,
  EscPosTable,
  EscPosTableCell,
  EscPosText,
} from './EscPosPage';

import Jimp from 'jimp';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export class EscPosPageBuilder {
  private MAX_WIDTH;
  private CHAR_WIDTH;
  private esc_pos: Buffer[];

  private constructor(page: EscPosPage) {
    this.esc_pos = [];
    this.MAX_WIDTH = page.paperSize === 80 ? 576 : 384;
    this.CHAR_WIDTH = page.paperSize === 80 ? 48 : 32;
  }

  private normalizePercentages(percentages: number[]): number[] {
    const sum = percentages.reduce((acc, value) => acc + value, 0);
    if (sum <= 0) {
      return [];
    }
    return percentages.map((value) => (value / sum) * 100);
  }

  private defaultTablePercents(columnCount: number): number[] {
    if (columnCount === 3) {
      return [60, 20, 20];
    }
    return Array.from({ length: columnCount }, () => 100 / columnCount);
  }

  private getTableColumnWidths(table: EscPosTable, columnCount: number): number[] {
    const totalWidth = this.CHAR_WIDTH;
    let percents = table.columnWidths ? table.columnWidths.slice(0, columnCount) : [];

    if (percents.length < columnCount) {
      const sum = percents.reduce((acc, value) => acc + value, 0);
      const remaining = Math.max(0, 100 - sum);
      const fill =
        columnCount - percents.length > 0 ? remaining / (columnCount - percents.length) : 0;
      while (percents.length < columnCount) {
        percents.push(fill || 1);
      }
    }

    if (percents.length === 0 || percents.every((value) => value <= 0)) {
      percents = this.defaultTablePercents(columnCount);
    }

    const normalized = this.normalizePercentages(percents);
    const normalizedPercents =
      normalized.length > 0 ? normalized : this.defaultTablePercents(columnCount);
    const widths = normalizedPercents.map((percent) =>
      Math.max(1, Math.floor((totalWidth * percent) / 100))
    );

    const widthSum = widths.reduce((acc, value) => acc + value, 0);
    const remainder = totalWidth - widthSum;
    if (remainder !== 0) {
      widths[widths.length - 1] = Math.max(1, widths[widths.length - 1] + remainder);
    }

    return widths;
  }

  private wrapText(text: string, width: number): string[] {
    if (width <= 0) {
      return [''];
    }
    const normalized = text.replace(/\r/g, '');
    const segments = normalized.split('\n');
    const lines: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) {
        lines.push('');
        continue;
      }
      for (let start = 0; start < segment.length; start += width) {
        lines.push(segment.slice(start, start + width));
      }
      if (i < segments.length - 1) {
        lines.push('');
      }
    }

    return lines.length > 0 ? lines : [''];
  }

  private formatCell(text: string, width: number, align: 'left' | 'center' | 'right'): string {
    const truncated = text.length > width ? text.slice(0, width) : text;
    const padding = Math.max(0, width - truncated.length);

    switch (align) {
      case 'right':
        return ' '.repeat(padding) + truncated;
      case 'center': {
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + truncated + ' '.repeat(rightPad);
      }
      default:
        return truncated + ' '.repeat(padding);
    }
  }

  private buildTableRowLines(
    cells: EscPosTableCell[],
    widths: number[],
    defaultAlign: 'left' | 'center' | 'right'
  ): string[] {
    const columnCount = widths.length;
    const safeCells = Array.from(
      { length: columnCount },
      (_, index) => cells[index] || { text: '' }
    );
    const firstCellLines = this.wrapText(safeCells[0]?.text ?? '', widths[0]);
    const totalLines = Math.max(1, firstCellLines.length);
    const lines: string[] = [];

    for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
      let line = '';
      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        const cell = safeCells[colIndex] || { text: '' };
        const align = cell.align || defaultAlign;
        const cellText =
          colIndex === 0 ? firstCellLines[lineIndex] || '' : lineIndex === 0 ? cell.text || '' : '';
        line += this.formatCell(cellText, widths[colIndex], align);
      }
      lines.push(line);
    }

    return lines;
  }

  /*private async addImage(itemImg: EscPosImage): Promise<void> {
    let img: Jimp;

    img = await Jimp.read(itemImg.src as string);

    img.resize(this.MAX_WIDTH, Jimp.AUTO);
    img.grayscale().contrast(1);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Add image header command
    this.esc_pos.push(EscPosCommands.printImage(width, height));

    const   = width / 8;
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
  }*/

  private async addImage(itemImg: EscPosImage): Promise<void> {
    const threshold = itemImg.threshold ?? 160;

    const img = await Jimp.read(itemImg.src as string);

    img.resize(this.MAX_WIDTH, Jimp.AUTO);
    img.grayscale().contrast(0.5);

    const width = img.bitmap.width;
    const height = img.bitmap.height;
    const bytesPerLine = Math.ceil(width / 8);

    this.esc_pos.push(EscPosCommands.printImage(bytesPerLine, height));

    const imageData: number[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < bytesPerLine; x++) {
        let byte = 0;

        for (let b = 0; b < 8; b++) {
          const px = x * 8 + b;
          if (px < width) {
            const pixel = Jimp.intToRGBA(img.getPixelColor(px, y));
            const lum = (pixel.r + pixel.g + pixel.b) / 3;
            byte = (byte << 1) | (lum < threshold ? 1 : 0);
          } else {
            byte = byte << 1;
          }
        }

        imageData.push(byte);
      }
    }

    this.esc_pos.push(Buffer.from(imageData));
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
      const bytesPerLine = Math.ceil(width / 8);

      // Add image header command
      this.esc_pos.push(EscPosCommands.printImage(bytesPerLine, height));
      const imageData: number[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
          let byte = 0;

          for (let b = 0; b < 8; b++) {
            const px = x * 8 + b;
            if (px < width) {
              const pixel = Jimp.intToRGBA(img.getPixelColor(px, y));
              const lum = (pixel.r + pixel.g + pixel.b) / 3;
              byte = (byte << 1) | (lum < 128 ? 1 : 0);
            } else {
              byte = byte << 1;
            }
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
        EAN13: 'ean13',
        EAN8: 'ean8',
        CODE39: 'code39',
        ITF: 'interleaved2of5',
        CODABAR: 'codabar',
        CODE93: 'code93',
        CODE128: 'code128',
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
      const bytesPerLine = Math.ceil(imgWidth / 8);

      // Add image header command
      this.esc_pos.push(EscPosCommands.printImage(bytesPerLine, imgHeight));
      const imageData: number[] = [];

      for (let y = 0; y < imgHeight; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
          let byte = 0;

          for (let b = 0; b < 8; b++) {
            const px = x * 8 + b;
            if (px < imgWidth) {
              const pixel = Jimp.intToRGBA(img.getPixelColor(px, y));
              const lum = (pixel.r + pixel.g + pixel.b) / 3;

              // Inverted logic: white (255) = 0, black (0) = 1
              byte = (byte << 1) | (lum > 128 ? 0 : 1);
            } else {
              byte = byte << 1;
            }
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
    // Set alignment if specified
    if (itemText.align) {
      this.esc_pos.push(EscPosCommands.align(itemText.align));
    }

    // Set bold if specified
    if (itemText.bold !== undefined) {
      this.esc_pos.push(EscPosCommands.bold(itemText.bold));
    }

    // Set text size if specified
    if (itemText.size) {
      this.esc_pos.push(EscPosCommands.textSize(itemText.size.width, itemText.size.height));
    }

    // Add text
    let text = itemText.text;
    if (!text.endsWith('\n')) {
      text += '\n';
    }
    this.esc_pos.push(EscPosCommands.text(text));

    // Reset formatting to defaults
    if (itemText.bold !== undefined) {
      this.esc_pos.push(EscPosCommands.bold(false));
    }
    if (itemText.size) {
      this.esc_pos.push(EscPosCommands.textSize(1, 1));
    }
    if (itemText.align) {
      this.esc_pos.push(EscPosCommands.align('left'));
    }
  }

  private async addLineBreak(itemBreak: EscPosLineBreak): Promise<void> {
    const lines = itemBreak.lines || 1;
    const char = itemBreak.charLine || ' ';

    for (let i = 0; i < lines; i++) {
      let line = '';
      for (let j = 0; j < this.CHAR_WIDTH; j++) {
        line += char;
      }
      line += '\n';
      this.esc_pos.push(EscPosCommands.text(line));
    }
  }

  private addTable(table: EscPosTable): void {
    const header = table.header || [];
    const rows = table.rows || [];
    const columnCount = Math.max(header.length, rows[0]?.length || 0);

    if (columnCount === 0) {
      return;
    }

    const widths = this.getTableColumnWidths(table, columnCount);
    const defaultAlign = table.align || 'left';
    const lineChar = table.lineChar && table.lineChar.length > 0 ? table.lineChar[0] : '-';
    const rowSpacing = table.rowSpacing ?? 1;
    const footerLine = table.footerLine ?? true;

    this.esc_pos.push(EscPosCommands.align('left'));

    if (header.length > 0) {
      const headerBold = table.headerBold ?? header.some((cell) => cell?.bold);
      this.esc_pos.push(EscPosCommands.bold(headerBold));

      const headerLines = this.buildTableRowLines(header, widths, defaultAlign);
      for (const line of headerLines) {
        this.esc_pos.push(EscPosCommands.text(`${line}\n`));
      }

      this.esc_pos.push(EscPosCommands.bold(false));

      const separator = lineChar.repeat(this.CHAR_WIDTH);
      this.esc_pos.push(EscPosCommands.text(`${separator}\n`));
    }

    for (const row of rows) {
      const rowBold = row.some((cell) => cell?.bold);
      this.esc_pos.push(EscPosCommands.bold(rowBold));

      const rowLines = this.buildTableRowLines(row, widths, defaultAlign);
      for (const line of rowLines) {
        this.esc_pos.push(EscPosCommands.text(`${line}\n`));
      }

      this.esc_pos.push(EscPosCommands.bold(false));

      if (rowSpacing > 0) {
        this.esc_pos.push(EscPosCommands.lineFeed(rowSpacing));
      }
    }

    if (footerLine) {
      const separator = lineChar.repeat(this.CHAR_WIDTH);
      this.esc_pos.push(EscPosCommands.text(`${separator}\n`));
    }

    this.esc_pos.push(EscPosCommands.align('left'));
  }

  private async initialize(page: EscPosPage): Promise<void> {
    // No initialize command to avoid spacing at the start

    // Default to CP437 for Spanish accents (\u00d1/\u00f1, \u00dc/\u00fc, \u00c1...)
    // and general printer compatibility.
    this.esc_pos.push(EscPosCommands.selectCodeTable(page.codeTable ?? 0));

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

      if ('rows' in item) {
        this.addTable(item as EscPosTable);
      }

      if ('charLine' in item) {
        await this.addLineBreak(item);
      }

      if ('cut' in item && item.cut) {
        this.esc_pos.push(EscPosCommands.printAndFeed(item.feedLines || 5));
        this.esc_pos.push(EscPosCommands.cut());
      }

      if ('openDrawer' in item && item.openDrawer) {
        this.esc_pos.push(EscPosCommands.openDrawer());
      }
    }

    //if last item is not cut, add a cut at the end
    const lastItem = page.content[page.content.length - 1];
    if (!('cut' in lastItem) || ('cut' in lastItem && !lastItem.cut)) {
      // Reduce feed before cutting from 5 to 2 lines
      this.esc_pos.push(EscPosCommands.printAndFeed(5));
      this.esc_pos.push(EscPosCommands.cut());
    }
  }

  static async build(page: EscPosPage): Promise<Buffer> {
    const builder = new EscPosPageBuilder(page);
    await builder.initialize(page);

    const buffer = Buffer.concat(builder.esc_pos);
    return buffer;
  }
}
