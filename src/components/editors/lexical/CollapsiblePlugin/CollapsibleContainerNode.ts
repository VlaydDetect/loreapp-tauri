import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';

type SerializedCollapsibleContainerNode = Spread<{ open: boolean }, SerializedElementNode>;

export function convertDetailsElement(domNode: HTMLDetailsElement): DOMConversionOutput | null {
    const isOpen = domNode.open !== undefined ? domNode.open : true;
    const node = $createCollapsibleContainerNode(isOpen);
    return { node };
}

export class CollapsibleContainerNode extends ElementNode {
    __open: boolean;

    constructor(open: boolean, key?: NodeKey) {
        super(key);
        this.__open = open;
    }

    static getType() {
        return 'collapsible-container';
    }

    static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
        return new CollapsibleContainerNode(node.__open, node.__key);
    }

    createDOM(_config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('details');
        dom.classList.add('Collapsible__container');
        dom.open = this.__open;
        dom.addEventListener('toggle', () => {
            const open = editor.getEditorState().read(() => this.getOpen());
            if (open !== dom.open) {
                editor.update(() => this.toggleOpen());
            }
        });
        return dom;
    }

    updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLDetailsElement): boolean {
        if (prevNode.__open !== this.__open) {
            dom.open = this.__open;
        }

        return false;
    }

    static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
        return {
            details: (_domNode: HTMLDetailsElement) => ({
                conversion: convertDetailsElement,
                priority: 1,
            }),
        };
    }

    static importJSON(
        serializedNode: SerializedCollapsibleContainerNode,
    ): CollapsibleContainerNode {
        return $createCollapsibleContainerNode(serializedNode.open);
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('details');
        element.setAttribute('open', this.__open.toString());
        return { element };
    }

    exportJSON(): SerializedCollapsibleContainerNode {
        return {
            ...super.exportJSON(),
            open: this.__open,
            type: this.getType(),
            version: 1,
        };
    }

    setOpen(open: boolean): void {
        const writable = this.getWritable();
        writable.__open = open;
    }

    getOpen(): boolean {
        return this.getLatest().__open;
    }

    toggleOpen(): void {
        this.setOpen(!this.getOpen());
    }
}

export function $createCollapsibleContainerNode(isOpen: boolean): CollapsibleContainerNode {
    return new CollapsibleContainerNode(isOpen);
}

export function $isCollapsibleContainerNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
    return node instanceof CollapsibleContainerNode;
}
