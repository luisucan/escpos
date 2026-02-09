import { printer } from '../src/index';

(async () => {
  const printers = await printer.getListPrinters();
  console.log(printers);
})();
