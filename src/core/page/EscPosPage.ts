export interface EscPosText {
    text: string;
    bold?: boolean;
    size?: {
        width: number;
        height: number;
    };
    align?: 'left' | 'center' | 'right';
}

export interface EscPosImage {
    src: string;
    type: 'local' | 'url';
}

export interface EscPosQrCode {
    qrContent: string;
    alignment?: 'left' | 'center' | 'right';
    size?: number;
    errorLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface EscPosLineBreak  {
    lines: number;
    charLine: string;
}

export interface EscPosBarcode {
    barcodeContent: string;
    type: 'UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128';
    height?: number;
    width?: number;
    textPosition?: 'none' | 'above' | 'below' | 'both';
    align?: 'left' | 'center' | 'right';
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
    content: (EscPosText | EscPosImage | EscPosQrCode | EscPosBarcode | EscPosLineBreak)[];
}