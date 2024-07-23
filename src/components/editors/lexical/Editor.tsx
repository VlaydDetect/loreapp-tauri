import React, { useEffect, useState } from 'react';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import { CAN_USE_DOM } from '@/utils';

import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './ActionsPlugin';
import AutocompletePlugin from './AutocompletePlugin';
import AutoLinkPlugin from './AutoLinkPlugin';
import CodeActionMenuPlugin from './CodeActionMenuPlugin';
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
import { LayoutPlugin } from './LayoutPlugin/LayoutPlugin';
import LinkPlugin from './LinkPlugin';
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './MarkdownShortcutPlugin';
import { MaxLengthPlugin } from './MaxLengthPlugin';
import PageBreakPlugin from './PageBreakPlugin';
import SpeechToTextPlugin from './SpeechToTextPlugin';
import TabFocusPlugin from './TabFocusPlugin';
import TableCellActionMenuPlugin from './TableActionMenuPlugin';
import TableCellResizer from './TableCellResizer';
import ToolbarPlugin from './ToolbarPlugin';
// import TreeViewPlugin from './TreeViewPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { DEFAULT_SETTINGS } from './defaultSettings';

const Editor = () => {
    const { historyState } = useSharedHistoryContext();
    const {
        isAutocomplete,
        isMaxLength,
        isCharLimit,
        isCharLimitUtf8,
        shouldUseLexicalContextMenu,
        tableCellMerge,
        tableCellBackgroundColor,
    } = DEFAULT_SETTINGS;
    const isEditable = useLexicalEditable();
    const text = 'Enter some rich text...';
    const placeholder = <Placeholder>{text}</Placeholder>;
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    useEffect(() => {
        const updateViewPortWidth = () => {
            const isNextSmallWidthViewport =
                CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

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
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            <div
                className={`tw-bg-white tw-relative tw-block tw-rounded-bl-[10px] tw-rounded-br-[10px]`}
            >
                {isMaxLength && <MaxLengthPlugin maxLength={30} />}
                <DragDropPaste />
                <AutoFocusPlugin />
                <ClearEditorPlugin />
                <ComponentPickerPlugin />

                <HashtagPlugin />
                <KeywordsPlugin />
                <SpeechToTextPlugin />
                <AutoLinkPlugin />

                <HistoryPlugin externalHistoryState={historyState} />
                <RichTextPlugin
                    contentEditable={
                        <div className="tw-min-h-[150px] tw-border-[0] tw-flex tw-relative tw-outline-0 tw-z-0 tw-overflow-auto tw-resize-y">
                            <div
                                className="tw-flex-auto tw-relative tw-resize-y tw-z-[-1]"
                                ref={onRef}
                            >
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
                <LayoutPlugin />
                {floatingAnchorElem && !isSmallWidthViewport && (
                    <>
                        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                        <FloatingLinkEditorPlugin
                            anchorElem={floatingAnchorElem}
                            isLinkEditMode={isLinkEditMode}
                            setIsLinkEditMode={setIsLinkEditMode}
                        />
                        <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge />
                        <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
                    </>
                )}

                {(isCharLimit || isCharLimitUtf8) && (
                    <CharacterLimitPlugin
                        charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
                        maxLength={5}
                    />
                )}
                {isAutocomplete && <AutocompletePlugin />}
                {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
                <ActionsPlugin />
            </div>
            {/* TO DEBUG */}
            {/* {showTreeView && <TreeViewPlugin />} */}
        </>
    );
};

export default Editor;
