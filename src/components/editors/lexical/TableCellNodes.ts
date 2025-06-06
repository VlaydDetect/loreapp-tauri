/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Klass, LexicalNode } from 'lexical';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { AutocompleteNode } from './AutocompletePlugin/AutocompleteNode';
import { EquationNode } from './EquationPlugin/EquationNode';
import { ExcalidrawNode } from './ExcalidrawPlugin/node';
import { ImageNode } from './ImagePlugin/ImageNode';
import { KeywordNode } from './KeywordPlugin/KeywordNode';

const TableCellNodes: Array<Klass<LexicalNode>> = [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    HashtagNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    ExcalidrawNode,
    EquationNode,
    AutocompleteNode,
    KeywordNode,
];

export default TableCellNodes;
