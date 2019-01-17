declare namespace JSW {
    class Button extends Window {
        nodeText: HTMLElement;
        constructor(text?: string);
        setText(text: string): void;
    }
    class TextBox extends Window {
        nodeText: HTMLInputElement;
        constructor(text?: string);
        setText(text: string): void;
        getText(): string;
        getTextNode(): HTMLInputElement;
    }
}
