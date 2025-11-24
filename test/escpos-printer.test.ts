/*import { Writable } from 'stream';

describe('EscPosPrinter', () => {
  let printer: EscPosPrinter;

  beforeEach(() => {
    printer = new EscPosPrinter();
  });

  describe('constructor', () => {
    test('should create a new printer instance', () => {
      expect(printer).toBeInstanceOf(EscPosPrinter);
    });
  });

  describe('initialize()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.initialize();
      expect(result).toBe(printer);
    });

    test('should add initialization command to buffer', () => {
      printer.initialize();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toContain('\x1B@');
    });
  });

  describe('text()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.text('Hello');
      expect(result).toBe(printer);
    });

    test('should add text to buffer', () => {
      printer.text('Hello World');
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('Hello World');
    });

    test('should handle multiple text calls', () => {
      printer.text('Hello').text(' ').text('World');
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('Hello World');
    });
  });

  describe('feed()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.feed();
      expect(result).toBe(printer);
    });

    test('should add single line feed by default', () => {
      printer.feed();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x0A');
    });

    test('should add multiple line feeds', () => {
      printer.feed(3);
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x0A\x0A\x0A');
    });
  });

  describe('align()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.align('center');
      expect(result).toBe(printer);
    });

    test('should add left alignment command', () => {
      printer.align('left');
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1Ba\x00');
    });

    test('should add center alignment command', () => {
      printer.align('center');
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1Ba\x01');
    });

    test('should add right alignment command', () => {
      printer.align('right');
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1Ba\x02');
    });
  });

  describe('bold()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.bold();
      expect(result).toBe(printer);
    });

    test('should enable bold by default', () => {
      printer.bold();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1BE\x01');
    });

    test('should disable bold', () => {
      printer.bold(false);
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1BE\x00');
    });
  });

  describe('size()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.size(2, 2);
      expect(result).toBe(printer);
    });

    test('should set normal size by default', () => {
      printer.size();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1D!\x00');
    });

    test('should set double width and height', () => {
      printer.size(2, 2);
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1D!\x11');
    });
  });

  describe('cut()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.cut();
      expect(result).toBe(printer);
    });

    test('should add full cut command by default', () => {
      printer.cut();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1DV\x00');
    });

    test('should add partial cut command', () => {
      printer.cut(true);
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toBe('\x1DV\x01');
    });
  });

  describe('getBuffer()', () => {
    test('should return empty buffer for new printer', () => {
      const buffer = printer.getBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBe(0);
    });

    test('should concatenate all commands', () => {
      printer.initialize().text('Hello').feed().cut();
      const buffer = printer.getBuffer();
      expect(buffer.toString()).toContain('\x1B@');
      expect(buffer.toString()).toContain('Hello');
      expect(buffer.toString()).toContain('\x0A');
      expect(buffer.toString()).toContain('\x1DV\x00');
    });
  });

  describe('clear()', () => {
    test('should return printer instance for chaining', () => {
      const result = printer.clear();
      expect(result).toBe(printer);
    });

    test('should clear the buffer', () => {
      printer.text('Hello').feed();
      expect(printer.getBuffer().length).toBeGreaterThan(0);
      
      printer.clear();
      const buffer = printer.getBuffer();
      expect(buffer.length).toBe(0);
    });
  });

  describe('print()', () => {
    test('should return buffer when no stream provided', async () => {
      printer.text('Hello');
      const result = await printer.print();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('Hello');
    });

    test('should write to stream when provided', async () => {
      const chunks: Buffer[] = [];
      const mockStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(Buffer.from(chunk));
          callback();
        },
      });

      printer.text('Test Message');
      const result = await printer.print(mockStream);
      
      expect(result).toBeInstanceOf(Buffer);
      expect(Buffer.concat(chunks).toString()).toBe('Test Message');
    });
  });

  describe('Method Chaining', () => {
    test('should allow complex chaining', () => {
      const result = printer
        .initialize()
        .align('center')
        .bold(true)
        .size(2, 2)
        .text('RECEIPT')
        .bold(false)
        .size(1, 1)
        .feed(2)
        .align('left')
        .text('Item 1: $10.00')
        .feed()
        .text('Item 2: $20.00')
        .feed(2)
        .cut();

      expect(result).toBe(printer);
      const buffer = printer.getBuffer();
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.toString()).toContain('RECEIPT');
      expect(buffer.toString()).toContain('Item 1: $10.00');
      expect(buffer.toString()).toContain('Item 2: $20.00');
    });
  });

  describe('Integration Tests', () => {
    test('should build a complete receipt', () => {
      printer
        .initialize()
        .align('center')
        .bold(true)
        .text('STORE NAME')
        .bold(false)
        .feed()
        .text('123 Main Street')
        .feed()
        .text('Tel: 555-1234')
        .feed(2)
        .align('left')
        .text('--------------------------------')
        .feed()
        .text('Item           Qty      Price')
        .feed()
        .text('--------------------------------')
        .feed()
        .text('Product A       2      $20.00')
        .feed()
        .text('Product B       1      $15.00')
        .feed()
        .text('--------------------------------')
        .feed()
        .align('right')
        .bold(true)
        .text('TOTAL: $35.00')
        .bold(false)
        .feed(3)
        .align('center')
        .text('Thank you for your purchase!')
        .feed(2)
        .cut();

      const buffer = printer.getBuffer();
      expect(buffer.toString()).toContain('STORE NAME');
      expect(buffer.toString()).toContain('TOTAL: $35.00');
      expect(buffer.toString()).toContain('Thank you for your purchase!');
    });

    test('should reset state after clear', () => {
      printer.text('First').feed();
      const firstBuffer = printer.getBuffer();
      expect(firstBuffer.length).toBeGreaterThan(0);

      printer.clear();
      printer.text('Second').feed();
      const secondBuffer = printer.getBuffer();
      
      expect(secondBuffer.toString()).toBe('Second\x0A');
      expect(secondBuffer.toString()).not.toContain('First');
    });
  });
});
*/