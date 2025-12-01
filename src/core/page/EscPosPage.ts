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
    content: (EscPosText | EscPosImage)[];
}