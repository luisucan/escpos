import { EscPosPrinterImpl } from '../EscPosPrinterImp';
import { EscPosPage } from '../page/EscPosPage';

import { exec } from 'child_process';
import { EscPosPageBuilder } from '../page/EscPosPageBuilder';

export class EscPostPrinterMacOs extends EscPosPrinterImpl {
  print(page: EscPosPage): void {
    try {
      console.log('Printing on MacOS USB printer MAC...', page);

      const ESC_POS: Buffer = EscPosPageBuilder.build(page);

      const child = exec(`lp -o raw -d "${page.printer}"`, (err) => {
        if (err) console.error('ERROR al imprimir:', err);
        else console.log('Ticket enviado a CUPS (macOS) sin archivo');
      });

      // Enviar el buffer al stdin del proceso lp
      if (child.stdin) {
        child.stdin.write(ESC_POS);
        child.stdin.end();
      }
    } catch (error) {
      console.error('ERROR en el proceso de impresión:', error);
    }
  }
}
