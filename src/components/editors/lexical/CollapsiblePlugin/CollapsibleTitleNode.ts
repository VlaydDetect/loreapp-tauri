import {
    $createParagraphNode,
    $isElementNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    ElementNode,
    LexicalNode,
    RangeSelection,
    SerializedElementNode,
} from 'lexical';

import { $isCollapsibleContainerNode } from './CollapsibleContainerNode';
import { $isCollapsibleContentNode } from './CollapsibleContentNode';

type SerializedCollapsibleTitleNode = SerializedElementNode;

export const convertSummaryElement = (): DOMConversionOutput | null => ({
    node: $createCollapsibleTitleNode(),
});

export class CollapsibleTitleNode extends ElementNode {
    static getType(): string {
        return 'collapsible-title';
    }

    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }

    createDOM(): HTMLElement {
        const dom = document.createElement('summary');
        dom.classList.add('Collapsible__title');
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            summary: () => ({
                conversion: convertSummaryElement,
                priority: 1,
            }),
        };
    }

    static importJSON(): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('summary');
        return { element };
    }

    exportJSON(): SerializedCollapsibleTitleNode {
        return {
            ...super.exportJSON(),
            type: this.getType(),
            version: 1,
        };
    }

    collapseAtStart(_selection: RangeSelection): boolean {
        this.getParentOrThrow().insertBefore(this);
        return true;
    }

    insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
        const containerNode = this.getParentOrThrow();

        if (!$isCollapsibleContainerNode(containerNode)) {
            throw new Error('CollapsibleTitleNode expects to be child of CollapsibleContainerNode');
        }

        if (containerNode.getOpen()) {
            const contentNode = this.getNextSibling();
            if (!$isCollapsibleContentNode(contentNode)) {
                throw new Error(
                    'CollapsibleTitleNode expects to have CollapsibleContentNode sibling',
                );
            }

            const firstChild = contentNode.getFirstChild();
            if ($isElementNode(firstChild)) {
                return firstChild;
            }

            const paragraph = $createParagraphNode();
            contentNode.append(paragraph);
            return paragraph;
        }

        const paragraph = $createParagraphNode();
        containerNode.insertAfter(paragraph, restoreSelection);
        return paragraph;
    }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return new CollapsibleTitleNode();
}

export function $isCollapsibleTitleNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}
