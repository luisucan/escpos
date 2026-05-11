import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { EscPosPage } from '../page/EscPosPage';

import { exec } from 'child_process';
import { EscPosPageBuilder } from '../page/EscPosPageBuilder';
import { PrinterInfo } from '../interfaces/PrinterInfo';

export class EscPosPrinterMacOs extends EscPosPrinterImpl {
  async print(page: EscPosPage): Promise<void> {
    const ESC_POS: Buffer = await EscPosPageBuilder.build(page);

    return new Promise((resolve, reject) => {
      const child = exec(`lp -o raw -d "${page.printer}"`, (err, stdout, stderr) => {
        if (err) {
          console.error('ERROR al imprimir:', err);
          console.error('stderr:', stderr);
          reject(err);
        } else {
          console.log('Ticket enviado a CUPS (macOS)');
          if (stdout) console.log('stdout:', stdout);
          resolve();
        }
      });

      if (!child.stdin) {
        reject(new Error('No se pudo acceder al stdin del proceso lp'));
        return;
      }

      child.stdin.write(ESC_POS, (err) => {
        if (err) {
          reject(err);
          return;
        }
        child.stdin?.end();
      });
    });
  }

  async getListPrinters(): Promise<PrinterInfo[]>{
    return new Promise((resolve, reject)=>{
      exec('LANG=C lpstat -p', (error, stdout)=>{
        if(error){
          reject(error)
          return
        }

        resolve(this.parseLpstatOutput(stdout))
      })
    })
  }

  private parseLpstatOutput(output: string): PrinterInfo[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('printer '))
      .map((line) => {
        const parts = line.split(' ')
        return { name: parts[1] ?? '' }
      })
      .filter((printer) => printer.name.length > 0)
  }
}
