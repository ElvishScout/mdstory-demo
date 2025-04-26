import "./style.css";

export class FcEditor extends HTMLTextAreaElement {
  private _tabSize: number = 2;

  constructor() {
    super();
    this.classList.add("fc-editor");
    this.addEventListener("keydown", this.handleKeyDown);
  }

  get tabSize() {
    return this._tabSize;
  }

  set tabSize(value: number) {
    this._tabSize = value;
  }

  handleKeyDown(event: KeyboardEvent) {
    const { key } = event;

    if (key === "Tab") {
      event.preventDefault();
      this.handleTab();
    } else if (key === "Backspace") {
      if (this.shouldHandleBackspace()) {
        event.preventDefault();
        this.handleBackspace();
      }
    } else if (key === "Enter") {
      event.preventDefault();
      this.handleEnter();
    }
  }

  handleTab() {
    const { selectionStart, value } = this;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const spacesToAdd = this.calculateSpacesToAdd(lineStart, selectionStart);

    this.insertTextAtCursor(" ".repeat(spacesToAdd));
  }

  calculateSpacesToAdd(lineStart: number, cursorPos: number) {
    const spacesInLine = cursorPos - lineStart;
    const spacesToNextTab = this.tabSize - (spacesInLine % this.tabSize);
    return Math.max(1, spacesToNextTab);
  }

  shouldHandleBackspace() {
    const { selectionStart, selectionEnd, value } = this;
    if (selectionStart !== selectionEnd) return false;

    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const textToCursor = value.slice(lineStart, selectionStart);
    return textToCursor.trim() === "" && selectionStart > lineStart;
  }

  handleBackspace() {
    const { selectionStart, value } = this;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const spacesInLine = selectionStart - lineStart;
    const spacesToRemove = spacesInLine % this.tabSize || this.tabSize;

    this.setSelectionRange(selectionStart - spacesToRemove, selectionStart);
    this.insertTextAtCursor("");
  }

  handleEnter() {
    const { selectionStart, value } = this;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineText = value.slice(lineStart, selectionStart);
    const indent = lineText.match(/^\s*/)![0];

    this.insertTextAtCursor("\n" + indent);
  }

  insertTextAtCursor(text: string) {
    const { selectionStart, selectionEnd } = this;
    this.value = this.value.slice(0, selectionStart) + text + this.value.slice(selectionEnd);
    const newCursorPos = selectionStart + text.length;
    this.setSelectionRange(newCursorPos, newCursorPos);
  }
}
