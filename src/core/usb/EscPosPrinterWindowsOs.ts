import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { PrinterInfo } from '../interfaces/PrinterInfo';
import { EscPosPage } from '../page/EscPosPage';

import { execFile } from 'child_process';

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
      // Prefer PowerShell (available in Windows 10/11). Fallback to WMIC for older setups.
      const psPrinters = await this.getPrintersViaPowerShell();
      if (psPrinters.length > 0) {
        return psPrinters;
      }
      return await this.getPrintersViaWmic();
    } catch (error) {
      console.warn('[EscPosPrinterWindowsOs] Could not list printers.', error);
      return [];
    }
  }

  private getPrintersViaPowerShell(): Promise<PrinterInfo[]> {
    // Use CIM instead of Get-Printer because it works even when the PrintManagement module isn't present.
    const script =
      'Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name | Where-Object { $_ -and $_.Trim().Length -gt 0 }';

    const args = [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ];

    return new Promise((resolve) => {
      execFile('powershell.exe', args, { windowsHide: true }, (error, stdout) => {
        if (error) {
          resolve([]);
          return;
        }
        resolve(this.parsePrinterNames(stdout));
      });
    });
  }

  private getPrintersViaWmic(): Promise<PrinterInfo[]> {
    return new Promise((resolve) => {
      execFile('wmic', ['printer', 'get', 'name'], { windowsHide: true }, (error, stdout) => {
        if (error) {
          resolve([]);
          return;
        }

        // WMIC output includes a header line like "Name".
        const printers = this.parsePrinterNames(stdout).filter(
          (p) => p.name.toLowerCase() !== 'name'
        );
        resolve(printers);
      });
    });
  }

  private parsePrinterNames(output: string): PrinterInfo[] {
    return output
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((name) => ({ name }));
  }
}
