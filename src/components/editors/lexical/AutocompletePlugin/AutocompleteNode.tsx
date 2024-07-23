import React from 'react';
import type { Spread } from 'lexical';
import { DecoratorNode, NodeKey, SerializedLexicalNode } from 'lexical';
import { useSharedAutocompleteContext } from '../context/SharedAutocompleteContext';
import { uuid as UUID } from './utils';

type SerializedAutocompleteNode = Spread<{ uuid: string }, SerializedLexicalNode>;

export class AutocompleteNode extends DecoratorNode<JSX.Element | null> {
    __uuid: string;

    constructor(uuid: string, key?: NodeKey) {
        super(key);
        this.__uuid = uuid;
    }

    static clone(node: AutocompleteNode): AutocompleteNode {
        return new AutocompleteNode(node.__uuid, node.__key);
    }

    static getType() {
        return 'autocomplete';
    }

    static importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
        return $createAutocompleteNode(serializedNode.uuid);
    }

    exportJSON(): SerializedAutocompleteNode {
        return {
            ...super.exportJSON(),
            type: this.getType(),
            uuid: this.__uuid,
            version: 1,
        };
    }

    updateDOM(): boolean {
        return false;
    }

    createDOM(): HTMLElement {
        return document.createElement('span');
    }

    decorate(): JSX.Element | null {
        if (this.__uuid !== UUID) {
            return null;
        }
        return <AutocompleteComponent />;
    }
}

export function $createAutocompleteNode(uuid: string): AutocompleteNode {
    return new AutocompleteNode(uuid);
}

function AutocompleteComponent() {
    const [suggestion] = useSharedAutocompleteContext();
    return (
        <span className="tw-text-[#ccc]" spellCheck="true">
            {suggestion} {'(TAB)'}
        </span>
    );
}
