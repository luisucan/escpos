import os from 'os';
import { EscPosPrinter } from './EscPostPrinter';
import { EscPostPrinterMacOs } from './usb/EscPostPrinterMacOs';

export class EscPosFactory {
  static createOsUsbPrinter(): EscPosPrinter {
    console.log('Platform:', os.platform());
    console.log('Type:', os.type());
    console.log('Release:', os.release());

    switch (os.platform()) {
      case 'darwin':
        const print = new EscPostPrinterMacOs();
        return print;
      default:
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
  }
}
