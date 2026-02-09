declare module 'printer' {
  export type NativePrinter = {
    name?: string;
  };

  export function getPrinters(): NativePrinter[];

  const printer: {
    getPrinters: typeof getPrinters;
  };

  export default printer;
}
