import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { EscPosPage } from '../page/EscPosPage';

import { exec } from 'child_process';
import { EscPosPageBuilder } from '../page/EscPosPageBuilder';

export class EscPostPrinterMacOs extends EscPosPrinterImpl {
  async print(page: EscPosPage): Promise<void> {
    try {
      console.log('Printing on MacOS USB printer MAC...', page);

      const ESC_POS: Buffer = await EscPosPageBuilder.build(page);

      const child = exec(`lp -o raw -d "${page.printer}"`, (err, stdout, stderr) => {
        if (err) {
          console.error('ERROR al imprimir:', err);
          console.error('stderr:', stderr);
        } else {
          console.log('Ticket enviado a CUPS (macOS)');
          if (stdout) console.log('stdout:', stdout);
        }
      });

      // Enviar el buffer al stdin del proceso lp
      if (child.stdin) {
        child.stdin.write(ESC_POS, (err) => {
          if (err) {
            console.error('Error escribiendo al stdin:', err);
          }
          child.stdin?.end();
        });
      } else {
        console.error('No se pudo acceder al stdin del proceso');
      }
    } catch (error) {
      console.error('ERROR en el proceso de impresión:', error);
    }
  }
}
