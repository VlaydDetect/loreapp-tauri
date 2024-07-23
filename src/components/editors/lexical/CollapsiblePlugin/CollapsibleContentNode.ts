import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    ElementNode,
    LexicalNode,
    SerializedElementNode,
} from 'lexical';

type SerializedCollapsibleContentNode = SerializedElementNode;

export const convertCollapsibleContentElement = (): DOMConversionOutput | null => ({
    node: $createCollapsibleContentNode(),
});

export class CollapsibleContentNode extends ElementNode {
    static getType(): string {
        return 'collapsible-content';
    }

    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__key);
    }

    createDOM(): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('Collapsible__content');
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-lexical-collapsible-content')) return null;
                return {
                    conversion: convertCollapsibleContentElement,
                    priority: 2,
                };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.setAttribute('data-lexical-collapsible-content', 'true');
        return { element };
    }

    static importJSON(): CollapsibleContentNode {
        return $createCollapsibleContentNode();
    }

    isShadowRoot(): boolean {
        return true;
    }

    exportJSON(): SerializedCollapsibleContentNode {
        return {
            ...super.exportJSON(),
            type: this.getType(),
            version: 1,
        };
    }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
    return new CollapsibleContentNode();
}

export function $isCollapsibleContentNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}
