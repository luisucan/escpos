import os from 'os';
import { EscPosPrinter } from './EscPostPrinter';
import { EscPosPrinterMacOs } from './usb/EscPosPrinterMacOs';
import { EscPosPrinterWindowsOs } from './usb/EscPosPrinterWindowsOs';

export class EscPosFactory {
  static createOsUsbPrinter(): EscPosPrinter {
    console.log('Platform:', os.platform());
    console.log('Type:', os.type());
    console.log('Release:', os.release());

    switch (os.platform()) {
      case 'darwin':
        return new EscPosPrinterMacOs();
      case 'win32':
        return new EscPosPrinterWindowsOs();
      case 'linux':
        throw new Error(`Unsupported platform: ${os.platform()}`);
      default:
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
  }
}
