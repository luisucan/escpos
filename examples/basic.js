const { EscPosPrinter } = require('../dist/index');

/**
 * Basic example of using the ESC/POS library
 */
async function basicExample() {
  const printer = new EscPosPrinter();

  // Create a simple receipt
  printer
    .initialize()
    .align('center')
    .bold(true)
    .size(2, 2)
    .text('MY STORE')
    .feed(1)
    .bold(false)
    .size(1, 1)
    .text('123 Main Street')
    .feed(1)
    .text('City, State 12345')
    .feed(2)
    .align('left')
    .text('--------------------------------')
    .feed(1)
    .text('Item 1.................. $10.00')
    .feed(1)
    .text('Item 2.................. $15.00')
    .feed(1)
    .text('Item 3.................. $20.00')
    .feed(1)
    .text('--------------------------------')
    .feed(1)
    .align('right')
    .bold(true)
    .text('TOTAL: $45.00')
    .feed(1)
    .bold(false)
    .align('center')
    .feed(2)
    .text('Thank you for your purchase!')
    .feed(3)
    .cut();

  // Get the buffer
  const buffer = printer.getBuffer();
  
  console.log('Print buffer created successfully!');
  console.log(`Buffer size: ${buffer.length} bytes`);
  
  // In a real application, you would send this buffer to a printer
  // For example, using a serial port or network connection:
  // await printer.print(serialPort);
}

basicExample().catch(console.error);
