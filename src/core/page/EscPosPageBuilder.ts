import { EscPosCommands } from '../EscPosCommands';
import { EscPosPage, EscPosText } from './EscPosPage';

type ItemEscPos = Buffer | number;

export class EscPosPageBuilder {
  private esc_pos: ItemEscPos[];

  private constructor(page: EscPosPage) {
    this.esc_pos = [];
    this.initialize(page);
  }

  private addText(itemText: EscPosText): void {
    this.esc_pos.push(EscPosCommands.text(itemText.text));
    this.esc_pos.push(EscPosCommands.lineFeed());
  }

  private initialize(page: EscPosPage): void {
    this.esc_pos.push(...EscPosCommands.reset());

    // Initialize ESC/POS commands
    for (const item of page.content) {
      // Process each item in the page content
      // For example, handle text, images, etc.
      if (item.text) {
        this.addText(item);
      }
    }

    this.esc_pos.push(EscPosCommands.cut());
  }

  static build(page: EscPosPage): Buffer {
    const builder = new EscPosPageBuilder(page);

    const buffer = Buffer.concat(builder.esc_pos as any);
    return buffer;
  }
}
