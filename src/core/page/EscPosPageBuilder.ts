import { EscPosCommands } from '../EscPosCommands';
import { EscPosPage, EscPosText } from './EscPosPage';

export class EscPosPageBuilder {
  private esc_pos: Buffer[];

  private constructor(page: EscPosPage) {
    this.esc_pos = [];
    this.initialize(page);
  }

  private addText(itemText: EscPosText): void {
    this.esc_pos.push(EscPosCommands.text(itemText.text));
    this.esc_pos.push(EscPosCommands.lineFeed());
  }

  private initialize(page: EscPosPage): void {
    this.esc_pos.push(EscPosCommands.initialize());

    // Initialize ESC/POS commands
    for (const item of page.content) {
      // Process each item in the page content
      // For example, handle text, images, etc.
      if (item.text) {
        this.addText(item);
      }
    }

    // Force print buffer and feed paper before cutting
    this.esc_pos.push(EscPosCommands.printAndFeed(5));
    this.esc_pos.push(EscPosCommands.cut());
  }

  static build(page: EscPosPage): Buffer {
    const builder = new EscPosPageBuilder(page);

    const buffer = Buffer.concat(builder.esc_pos);
    return buffer;
  }
}
