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
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { CollapsibleContainerNode } from './CollapsiblePlugin/CollapsibleContainerNode';
import { CollapsibleContentNode } from './CollapsiblePlugin/CollapsibleContentNode';
import { CollapsibleTitleNode } from './CollapsiblePlugin/CollapsibleTitleNode';
import { AutocompleteNode } from './AutocompletePlugin/AutocompleteNode';
import { EquationNode } from './EquationPlugin/EquationNode';
import { ExcalidrawNode } from './ExcalidrawPlugin/node';
import { ImageNode } from './ImagePlugin/ImageNode';
import { InlineImageNode } from './InlineImagePlugin/InlineImageNode';
import { KeywordNode } from './KeywordPlugin/KeywordNode';
import { LayoutContainerNode } from './LayoutPlugin/LayoutContainerNode';
import { LayoutItemNode } from './LayoutPlugin/LayoutItemNode';
import { PageBreakNode } from './PageBreakPlugin/node';
import { StickyNode } from './StickyPlugin/StickyNode';

const EditorNodes: Array<Klass<LexicalNode>> = [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    HashtagNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    OverflowNode,
    StickyNode,
    ImageNode,
    InlineImageNode,
    ExcalidrawNode,
    EquationNode,
    AutocompleteNode,
    KeywordNode,
    HorizontalRuleNode,
    MarkNode,
    CollapsibleContainerNode,
    CollapsibleContentNode,
    CollapsibleTitleNode,
    PageBreakNode,
    LayoutContainerNode,
    LayoutItemNode,
];

export default EditorNodes;
