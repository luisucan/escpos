import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { PrinterInfo } from '../interfaces/PrinterInfo';
import { EscPosPage } from '../page/EscPosPage';

import { execFile } from 'child_process';
import { EscPosPageBuilder } from '../page/EscPosPageBuilder';

export class EscPosPrinterWindowsOs extends EscPosPrinterImpl {
  async print(page: EscPosPage): Promise<void> {
    // Safety: this class might be imported/used from other OS.
    // No-op avoids runtime errors when handled by caller.
    if (process.platform !== 'win32') {
      console.warn('[EscPosPrinterWindowsOs] print() called on non-Windows platform.');
      return;
    }

    try {
      console.log('Printing on Windows USB printer...', page);

      const escPos: Buffer = await EscPosPageBuilder.build(page);
      await this.sendRawToSpooler(page.printer, escPos, 'ESC/POS Ticket');

      console.log('Ticket sent to Windows spooler (RAW).');
    } catch (error) {
      console.error('ERROR en el proceso de impresion (Windows):', error);
    }
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

  private sendRawToSpooler(printerName: string, data: Buffer, docName: string): Promise<void> {
    const psScript = this.buildPowerShellRawPrintScript();
    const args = [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      psScript,
    ];

    return new Promise((resolve, reject) => {
      const child = execFile(
        'powershell.exe',
        args,
        {
          windowsHide: true,
          env: {
            ...process.env,
            ESC_POS_PRINTER_NAME: printerName,
            ESC_POS_DOC_NAME: docName,
          },
          maxBuffer: 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (stdout) {
            console.log(stdout);
          }
          if (stderr) {
            console.error(stderr);
          }
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );

      if (!child.stdin) {
        reject(new Error('Could not access PowerShell stdin.'));
        return;
      }

      child.stdin.write(data, (err) => {
        if (err) {
          reject(err);
          return;
        }
        child.stdin?.end();
      });
    });
  }

  private buildPowerShellRawPrintScript(): string {
    // Uses Win32 spooler API via C# P/Invoke (no third-party deps).
    // Reads ESC/POS bytes from stdin and sends them as RAW.
    return `
$ErrorActionPreference = 'Stop'

$printerName = $env:ESC_POS_PRINTER_NAME
if ([string]::IsNullOrWhiteSpace($printerName)) { throw 'Missing printer name (ESC_POS_PRINTER_NAME).' }

$docName = $env:ESC_POS_DOC_NAME
if ([string]::IsNullOrWhiteSpace($docName)) { $docName = 'ESC/POS Job' }

# Read all bytes from stdin
$inputStream = [Console]::OpenStandardInput()
$ms = New-Object System.IO.MemoryStream
$buf = New-Object byte[] 8192
while (($read = $inputStream.Read($buf, 0, $buf.Length)) -gt 0) { $ms.Write($buf, 0, $read) }
$data = $ms.ToArray()

$code = @'
using System;
using System.Runtime.InteropServices;

public class RawPrinterHelper
{
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOC_INFO_1
  {
    public string pDocName;
    public string pOutputFile;
    public string pDataType;
  }

  [DllImport("winspool.drv", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

  [DllImport("winspool.drv", SetLastError=true)]
  public static extern bool ClosePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern int StartDocPrinter(IntPtr hPrinter, int Level, DOC_INFO_1 pDocInfo);

  [DllImport("winspool.drv", SetLastError=true)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError=true)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError=true)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.drv", SetLastError=true)]
  public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

  public static void SendBytes(string printerName, byte[] bytes, string docName)
  {
    IntPtr hPrinter;
    if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero))
      throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

    try
    {
      DOC_INFO_1 di = new DOC_INFO_1();
      di.pDocName = docName;
      di.pDataType = "RAW";

      int job = StartDocPrinter(hPrinter, 1, di);
      if (job == 0) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

      try
      {
        if (!StartPagePrinter(hPrinter)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

        try
        {
          int written;
          if (!WritePrinter(hPrinter, bytes, bytes.Length, out written))
            throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

          if (written != bytes.Length)
            throw new Exception("Partial write: " + written + "/" + bytes.Length);
        }
        finally { EndPagePrinter(hPrinter); }
      }
      finally { EndDocPrinter(hPrinter); }
    }
    finally { ClosePrinter(hPrinter); }
  }
}
'@

Add-Type -TypeDefinition $code -Language CSharp
[RawPrinterHelper]::SendBytes($printerName, $data, $docName)
`;
  }
}
