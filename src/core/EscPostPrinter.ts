import { PrinterInfo } from "./interfaces/PrinterInfo";
import { EscPosPage } from "./page/EscPosPage";

export interface EscPosPrinter {
  /**
   * Initialize the printer
   */
  initialize(): this;

  /**
   * Print text
   */
  text(content: string): this;

  /**
   * Add line feed
   */
  feed(lines?: number): this;

  /**
   * Set text alignment
   */
  align(alignment: 'left' | 'center' | 'right'): this;

  /**
   * Set bold text
   */
  bold(enabled?: boolean): this;

  /**
   * Set text size
   */
  size(width?: number, height?: number): this;

  /**
   * Cut the paper
   */
  cut(partial?: boolean): this;

  /**
   * Get the print buffer
   */
  getBuffer(): Buffer;

  /**
   * Clear the buffer
   */
  clear(): this;

  print(page: EscPosPage): Promise<void>;
  getListPrinters(): Promise<PrinterInfo[]>;
}