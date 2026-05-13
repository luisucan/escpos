interface EscPosBase {
  index?: string;
}

export interface EscPosText extends EscPosBase {
  text: string;
  bold?: boolean;
  size?: {
    width: number;
    height: number;
  };
  align?: 'left' | 'center' | 'right';
}

export interface EscPosImage extends EscPosBase {
  src: string;
  type: 'local' | 'url';
  threshold?: number; // 0–255
  width?: number;    // pixels; defaults to full paper width
  height?: number;   // pixels; defaults to auto (proportional)
  align?: 'left' | 'center' | 'right';
}

/** @deprecated Use EscPosCut instead */
export type EscPostCut = EscPosCut;

export interface EscPosCut extends EscPosBase {
  cut: boolean;
  feedLines?: number;
}

export interface EscPosOpenDrawer extends EscPosBase {
  openDrawer: boolean;
}

export interface EscPosQrCode extends EscPosBase {
  qrContent: string;
  align?: 'left' | 'center' | 'right';
  size?: number;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface EscPosLineBreak extends EscPosBase {
  lines?: number;
  charLine: string;
  text?: string;
  align?: 'left' | 'center' | 'right';
}

export interface EscPosBarcode extends EscPosBase {
  barcodeContent: string;
  type?: 'UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128';
  height?: number;
  width?: number;
  textPosition?: 'none' | 'above' | 'below' | 'both';
  align?: 'left' | 'center' | 'right';
}

export type EscPosContentItem =
  | EscPosText
  | EscPosImage
  | EscPosQrCode
  | EscPosBarcode
  | EscPosLineBreak
  | EscPosCut
  | EscPosOpenDrawer
  | EscPosTable
  | EscPosSection;

/** @deprecated index is now part of EscPosText directly */
export type EscPosSectionItem = EscPosText;

export interface EscPosSection extends EscPosBase {
  section: EscPosContentItem[];
}

export interface EscPosTableCell {
  text: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export type EscPosPaperSize = 58 | 80;

export enum EscPosPrinterType {
  USB = 'USB',
  NETWORK = 'NETWORK',
  SERIAL = 'SERIAL',
}

export interface EscPosPage {
  printer: string;
  printerType: EscPosPrinterType;
  paperSize: EscPosPaperSize;
  /**
   * ESC/POS character code table sent to the printer (ESC t n). Defaults to 0.
   * Use the value that corresponds to a Latin/Spanish page in YOUR printer's manual.
   */
  codeTable?: number;
  /**
   * iconv-lite encoding used to encode text. Overrides the encoding derived from codeTable.
   * Use this when your printer's table numbering differs from the standard Epson mapping.
   * Common values for Spanish: 'cp850', 'cp1252', 'cp437'.
   */
  encoding?: string;
  /**
   * Key-value pairs for template interpolation. Values replace {{key}} placeholders in text content.
   */
  data?: Record<string, string>;
  content: EscPosContentItem[];
}

export interface EscPosTable extends EscPosBase {
  header?: EscPosTableCell[];
  headerBold?: boolean;
  rows: EscPosTableCell[][];
  columnWidths?: number[];
  lineChar?: string;
  align?: 'left' | 'center' | 'right';
  rowSpacing?: number;
  footerLine?: boolean;
}
