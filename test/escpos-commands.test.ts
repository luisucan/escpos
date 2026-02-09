import { EscPosCommands } from '../src/core/EscPosCommands';
import iconv from 'iconv-lite';

describe('EscPosCommands', () => {
  describe('Control Characters', () => {
    test('should have correct ESC character', () => {
      expect(EscPosCommands.ESC).toBe('\x1B');
    });

    test('should have correct GS character', () => {
      expect(EscPosCommands.GS).toBe('\x1D');
    });

    test('should have correct FS character', () => {
      expect(EscPosCommands.FS).toBe('\x1C');
    });

    test('should have correct LF character', () => {
      expect(EscPosCommands.LF).toBe('\x0A');
    });

    test('should have correct CR character', () => {
      expect(EscPosCommands.CR).toBe('\x0D');
    });
  });

  describe('initialize()', () => {
    test('should return correct initialization command', () => {
      const result = EscPosCommands.initialize();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x1B@');
    });
  });

  describe('lineFeed()', () => {
    test('should return single line feed by default', () => {
      const result = EscPosCommands.lineFeed();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x0A');
    });

    test('should return multiple line feeds', () => {
      const result = EscPosCommands.lineFeed(3);
      expect(result.toString()).toBe('\x0A\x0A\x0A');
    });

    test('should handle zero lines', () => {
      const result = EscPosCommands.lineFeed(0);
      expect(result.toString()).toBe('');
    });
  });

  describe('cut()', () => {
    test('should return full cut command by default', () => {
      const result = EscPosCommands.cut();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x1DV\x00');
    });

    test('should return partial cut command', () => {
      const result = EscPosCommands.cut(true);
      expect(result.toString()).toBe('\x1DV\x01');
    });

    test('should return full cut command when explicitly set to false', () => {
      const result = EscPosCommands.cut(false);
      expect(result.toString()).toBe('\x1DV\x00');
    });
  });

  describe('align()', () => {
    test('should return left alignment command', () => {
      const result = EscPosCommands.align('left');
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x1Ba\x00');
    });

    test('should return center alignment command', () => {
      const result = EscPosCommands.align('center');
      expect(result.toString()).toBe('\x1Ba\x01');
    });

    test('should return right alignment command', () => {
      const result = EscPosCommands.align('right');
      expect(result.toString()).toBe('\x1Ba\x02');
    });
  });

  describe('bold()', () => {
    test('should return bold enabled by default', () => {
      const result = EscPosCommands.bold();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x1BE\x01');
    });

    test('should return bold enabled when explicitly set to true', () => {
      const result = EscPosCommands.bold(true);
      expect(result.toString()).toBe('\x1BE\x01');
    });

    test('should return bold disabled', () => {
      const result = EscPosCommands.bold(false);
      expect(result.toString()).toBe('\x1BE\x00');
    });
  });

  describe('textSize()', () => {
    test('should return normal size by default', () => {
      const result = EscPosCommands.textSize();
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('\x1D!\x00');
    });

    test('should return double width', () => {
      const result = EscPosCommands.textSize(2, 1);
      expect(result.toString()).toBe('\x1D!\x10');
    });

    test('should return double height', () => {
      const result = EscPosCommands.textSize(1, 2);
      expect(result.toString()).toBe('\x1D!\x01');
    });

    test('should return double width and height', () => {
      const result = EscPosCommands.textSize(2, 2);
      expect(result.toString()).toBe('\x1D!\x11');
    });

    test('should handle maximum size', () => {
      const result = EscPosCommands.textSize(8, 8);
      expect(result.toString()).toBe('\x1D!\x77');
    });
  });

  describe('text()', () => {
    test('should return text as buffer', () => {
      const result = EscPosCommands.text('Hello World');
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('Hello World');
    });

    test('should handle empty string', () => {
      const result = EscPosCommands.text('');
      expect(result.toString()).toBe('');
    });

    test('should handle special characters', () => {
      const text = '¡Hola! ñ á é í ó ú Á É Í Ó Ú Ñ Ü ü';
      const result = EscPosCommands.text(text);

      // Text is encoded using CP437 for ESC/POS compatibility.
      const expected = iconv.encode(text, 'cp437');
      expect(Buffer.compare(result, expected)).toBe(0);
    });

    test('should handle numbers', () => {
      const result = EscPosCommands.text('12345');
      expect(result.toString()).toBe('12345');
    });
  });
});
