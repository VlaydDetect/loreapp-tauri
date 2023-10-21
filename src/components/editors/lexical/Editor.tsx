/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {CAN_USE_DOM} from '@/utils/utils';

import {useSharedHistoryContext} from './context/SharedHistoryContext';
import TableCellNodes from './TableCellNodes';
import ActionsPlugin from './ActionsPlugin';
import AutocompletePlugin from './AutocompletePlugin';
import AutoLinkPlugin from './AutoLinkPlugin';
import CodeHighlightPlugin from './CodeHighlightPlugin';
import CollapsiblePlugin from './CollapsiblePlugin';
import ComponentPickerPlugin from './ComponentPickerPlugin';
import ContextMenuPlugin from './ContextMenuPlugin';
import DragDropPaste from './DragDropPastePlugin';
import DraggableBlockPlugin from './DraggableBlockPlugin';
import EquationsPlugin from './EquationPlugin';
import ExcalidrawPlugin from './ExcalidrawPlugin';
import FloatingLinkEditorPlugin from './FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './ImagePlugin';
import InlineImagePlugin from './InlineImagePlugin';
import KeywordsPlugin from './KeywordPlugin';
import LinkPlugin from './LinkPlugin';
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './MaxLengthPlugin';
import MentionsPlugin from './MentionPlugin';
import PageBreakPlugin from './PageBreakPlugin';
import SpeechToTextPlugin from './SpeechToTextPlugin';
import TabFocusPlugin from './TabFocusPlugin';
import TableCellActionMenuPlugin from './TableActionMenuPlugin';
import TableCellResizer from './TableCellResizer';
import TableOfContentsPlugin from './TableOfContentsPlugin';
import {TablePlugin as NewTablePlugin} from './TablePlugin';
import ToolbarPlugin from './ToolbarPlugin';
import TreeViewPlugin from './TreeViewPlugin';
import PlaygroundEditorTheme from './themes/BaseEditorTheme';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';

export default function LexicalEditor() {
    const {historyState} = useSharedHistoryContext();

    const isAutocomplete = true;
    const isMaxLength = false;
    const isCharLimit = false;
    const isCharLimitUtf8 = false;
    const showTreeView = true;
    const showTableOfContents = false;
    const shouldUseLexicalContextMenu = true;
    const tableCellMerge = true;
    const tableCellBackgroundColor = true;


    const isEditable = useLexicalEditable();
    const text = 'Enter some rich text...';
    const placeholder = <Placeholder>{text}</Placeholder>;
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    const cellEditorConfig = {
        namespace: 'Playground',
        nodes: [...TableCellNodes],
        onError: (error: Error) => {
            throw error;
        },
        theme: PlaygroundEditorTheme,
    };

    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

            if (isNextSmallWidthViewport !== isSmallWidthViewport) {
                setIsSmallWidthViewport(isNextSmallWidthViewport);
            }
        };
        updateViewPortWidth();
        window.addEventListener('resize', updateViewPortWidth);

        return () => {
            window.removeEventListener('resize', updateViewPortWidth);
        };
    }, [isSmallWidthViewport]);

    return (
        <>
            <ToolbarPlugin />
            <div
                className={`editor-container ${showTreeView ? 'tree-view' : ''}`}>
                {isMaxLength && <MaxLengthPlugin maxLength={30} />}
                <DragDropPaste />
                <AutoFocusPlugin />
                <ClearEditorPlugin />
                <ComponentPickerPlugin />

                <MentionsPlugin />
                <HashtagPlugin />
                <KeywordsPlugin />
                <SpeechToTextPlugin />
                <AutoLinkPlugin />

                <HistoryPlugin externalHistoryState={historyState} />
                <RichTextPlugin
                    contentEditable={
                        <div className="editor-scroller">
                            <div className="editor" ref={onRef}>
                                <ContentEditable />
                            </div>
                        </div>
                    }
                    placeholder={placeholder}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <MarkdownShortcutPlugin />
                <CodeHighlightPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <ListMaxIndentLevelPlugin maxDepth={7} />
                <TablePlugin
                    hasCellMerge={tableCellMerge}
                    hasCellBackgroundColor={tableCellBackgroundColor}
                />
                <TableCellResizer />
                <NewTablePlugin cellEditorConfig={cellEditorConfig}>
                    <AutoFocusPlugin />
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="TableNode__contentEditable" />
                        }
                        placeholder={null}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <MentionsPlugin />
                    <HistoryPlugin />
                    <ImagesPlugin captionsEnabled={false} />
                    <LinkPlugin />
                    <LexicalClickableLinkPlugin />
                    <FloatingTextFormatToolbarPlugin />
                </NewTablePlugin>
                <ImagesPlugin />
                <InlineImagePlugin />
                <LinkPlugin />
                {!isEditable && <LexicalClickableLinkPlugin />}
                <HorizontalRulePlugin />
                <EquationsPlugin />
                <ExcalidrawPlugin />
                <TabFocusPlugin />
                <TabIndentationPlugin />
                <CollapsiblePlugin />
                <PageBreakPlugin />
                {floatingAnchorElem && !isSmallWidthViewport && (
                    <>
                        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                        <TableCellActionMenuPlugin
                            anchorElem={floatingAnchorElem}
                            cellMerge={true}
                        />
                        <FloatingTextFormatToolbarPlugin
                            anchorElem={floatingAnchorElem}
                        />
                    </>
                )}

                {(isCharLimit || isCharLimitUtf8) && (
                    <CharacterLimitPlugin
                        charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
                        maxLength={5}
                    />
                )}
                {isAutocomplete && <AutocompletePlugin />}
                <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
                {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
                <ActionsPlugin isRichText={true} />
            </div>
            {showTreeView && <TreeViewPlugin />}
        </>
    );
}
