import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { PrinterInfo } from '../interfaces/PrinterInfo';
import { EscPosPage } from '../page/EscPosPage';

type NativePrinter = {
  name?: string;
};

export class EscPosPrinterWindowsOs extends EscPosPrinterImpl {
  print(_page: EscPosPage): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getListPrinters(): Promise<PrinterInfo[]> {
    // Safety: this class might be imported/used from other OS.
    // Returning an empty list avoids runtime errors when handled by caller.
    if (process.platform !== 'win32') {
      return [];
    }

    try {
      // Optional dependency with native bindings; load it only on Windows.
      const printerModule = (await import('printer')) as unknown as {
        default?: { getPrinters?: () => NativePrinter[] };
        getPrinters?: () => NativePrinter[];
      };
      const printer = printerModule.default ?? printerModule;

      const nativePrinters = printer.getPrinters?.() ?? [];
      return nativePrinters
        .map((p) => ({ name: typeof p?.name === 'string' ? p.name : '' }))
        .filter((p) => p.name.length > 0);
    } catch (error) {
      console.warn('[EscPosPrinterWindowsOs] Could not list printers.', error);
      return [];
    }
  }
}
