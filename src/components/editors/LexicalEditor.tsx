// import {$getRoot, $getSelection, EditorState, EditorThemeClasses} from "lexical";
//
// import {InitialConfigType, LexicalComposer} from "@lexical/react/LexicalComposer";
// import {ContentEditable} from "@lexical/react/LexicalContentEditable";
// import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
// import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
// import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
// import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";
// import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
//
// import { HeadingNode, QuoteNode } from "@lexical/rich-text";
// import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
// import { ListItemNode, ListNode } from "@lexical/list";
// import { CodeHighlightNode, CodeNode } from "@lexical/code";
// import { AutoLinkNode, LinkNode } from "@lexical/link";
// import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
// import { ListPlugin } from "@lexical/react/LexicalListPlugin";
// import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
// import { TRANSFORMERS } from "@lexical/markdown";
//
// import ToolbarPlugin from "@/components/editors/lexical/Toolbar/ToolbarPlugin";
// import {BannerNode, BannerPlugin} from "@/components/editors/lexical/BannerPlugin/BannerNode";
// import "./lexical/lexical.css"
//
// const theme: EditorThemeClasses = {
//     ltr: "ltr",
//     rtl: "rtl",
//     placeholder: "editor-placeholder",
//     paragraph: "editor-paragraph",
//     quote: "editor-quote",
//     heading: {
//         h1: "editor-heading-h1",
//         h2: "editor-heading-h2",
//         h3: "editor-heading-h3", // TODO
//         h4: "editor-heading-h4",
//         h5: "editor-heading-h5"
//     },
//     list: {
//         nested: {
//             listitem: "editor-nested-listitem"
//         },
//         ol: "editor-list-ol",
//         ul: "editor-list-ul",
//         listitem: "editor-listitem"
//     },
//     image: "editor-image",
//     link: "editor-link",
//     text: {
//         bold: "editor-text-bold",
//         italic: "editor-text-italic",
//         underline: "editor-text-underline",
//         strikethrough: "editor-text-strikethrough",
//         underlineStrikethrough: "editor-text-underlineStrikethrough",
//         code: "editor-text-code"
//     },
//     code: "editor-code",
//     codeHighlight: {
//         atrule: "editor-tokenAttr",
//         attr: "editor-tokenAttr",
//         boolean: "editor-tokenProperty",
//         builtin: "editor-tokenSelector",
//         cdata: "editor-tokenComment",
//         char: "editor-tokenSelector",
//         class: "editor-tokenFunction",
//         "class-name": "editor-tokenFunction",
//         comment: "editor-tokenComment",
//         constant: "editor-tokenProperty",
//         deleted: "editor-tokenProperty",
//         doctype: "editor-tokenComment",
//         entity: "editor-tokenOperator",
//         function: "editor-tokenFunction",
//         important: "editor-tokenVariable",
//         inserted: "editor-tokenSelector",
//         keyword: "editor-tokenAttr",
//         namespace: "editor-tokenVariable",
//         number: "editor-tokenProperty",
//         operator: "editor-tokenOperator",
//         prolog: "editor-tokenComment",
//         property: "editor-tokenProperty",
//         punctuation: "editor-tokenPunctuation",
//         regex: "editor-tokenVariable",
//         selector: "editor-tokenSelector",
//         string: "editor-tokenSelector",
//         symbol: "editor-tokenProperty",
//         tag: "editor-tokenProperty",
//         url: "editor-tokenOperator",
//         variable: "editor-tokenVariable"
//     },
//     banner: 'editor-Banner'
// };
//
// const onChange = (editorState: EditorState) => {
//     editorState.read(() => {
//         const root = $getRoot()
//         const selection = $getSelection()
//
//         console.log(root, selection)
//     })
// }
//
// const onError = (error: Error) => {
//     console.error(error)
// }
//
// const LexicalEditor = () => {
//     const editorConfig: InitialConfigType = {
//         namespace: 'LexicalEditor',
//         theme,
//         onError,
//         nodes: [
//             HeadingNode,
//             QuoteNode,
//             TableNode,
//             TableRowNode,
//             TableCellNode,
//             ListNode,
//             ListItemNode,
//             CodeNode,
//             CodeHighlightNode,
//             LinkNode,
//             AutoLinkNode,
//             BannerNode
//         ]
//     }
//
//     return (
//         <LexicalComposer initialConfig={editorConfig}>
//             <div className="relative m-[20px_auto_20px_auto] rounded-[2px] max-w-2xl text-[#000] leading-5 font-normal text-left rounded-tl-[10px] rounded-tr-[10px]">
//                 <ToolbarPlugin />
//                 <div className="relative bg-[#fff]">
//                     <BannerPlugin />
//                     <RichTextPlugin
//                         contentEditable={<ContentEditable className="editor-input"/>}
//                         placeholder={<div className="editor-placeholder">Enter some text...</div>}
//                         ErrorBoundary={LexicalErrorBoundary}
//                     />
//                     <OnChangePlugin onChange={onChange} />
//                     <HistoryPlugin />
//                     <AutoFocusPlugin />
//                     <ListPlugin />
//                     <LinkPlugin />
//                     <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
//                 </div>
//             </div>
//         </LexicalComposer>
//     )
// }
//
// export default LexicalEditor







/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { InitialConfigType, LexicalComposer} from '@lexical/react/LexicalComposer';
import * as React from 'react';

import {SharedAutocompleteContext} from './lexical/context/SharedAutocompleteContext';
import {SharedHistoryContext} from './lexical/context/SharedHistoryContext';
import Editor from './lexical/Editor';
import EditorNodes from './lexical/EditorNodes';
import {TableContext} from './lexical/TablePlugin';
import TypingPerfPlugin from './lexical/TypingPerfPlugin';
import BaseEditorTheme from './lexical/themes/BaseEditorTheme';

import './lexical/lexical.css'
import {EditorState} from "lexical";

export default function LexicalEditor({ initialEditorState }: { initialEditorState?: EditorState | undefined }) {

    const measureTypingPerf = false;

    const initialConfig: InitialConfigType = {
        namespace: 'LexicalEditor',
        nodes: [...EditorNodes],
        onError: (error: Error) => {
            throw error;
        },
        theme: BaseEditorTheme,
        editorState: initialEditorState
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
                <TableContext>
                    <SharedAutocompleteContext>

                        <div className="editor-shell">
                            <Editor />
                        </div>

                        {measureTypingPerf ? <TypingPerfPlugin /> : null}
                    </SharedAutocompleteContext>
                </TableContext>
            </SharedHistoryContext>
        </LexicalComposer>
    );
}
