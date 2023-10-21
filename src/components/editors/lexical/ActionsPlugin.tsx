/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorState, LexicalEditor, LexicalNode} from 'lexical';
import {
    $createTextNode,
    $getRoot,
    $isElementNode,
    $isParagraphNode,
    CLEAR_EDITOR_COMMAND,
    COMMAND_PRIORITY_EDITOR,
} from 'lexical';

import {$createCodeNode, $isCodeNode} from '@lexical/code';
import {exportFile, importFile} from '@lexical/file';
import {$convertFromMarkdownString, $convertToMarkdownString,} from '@lexical/markdown';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';

import useModal from './hooks/useModal';
import Button from './ui/Button';
import {TRANSFORMERS} from './MarkdownTransformers';
import {SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION,} from './SpeechToTextPlugin';
import {$isMarkNode, $unwrapMarkNode} from "@lexical/mark";

const sanitizeNode = (node: LexicalNode): void => {
    if ($isMarkNode(node)) {
        $unwrapMarkNode(node);
        return;
    }
    if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
            sanitizeNode(child);
        }
    }
};

export default function ActionsPlugin({isRichText}: { isRichText: boolean; }) {
    const [editor] = useLexicalComposerContext();
    const [currentEditorState, setCurrentEditorState] = useState<EditorState>(() => editor.getEditorState());
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [isSpeechToText, setIsSpeechToText] = useState(false);
    const [connected, setConnected] = useState(false);
    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    const [modal, showModal] = useModal();
    const {isCollabActive} = useCollaborationContext();


    async function sendEditorState(editor: LexicalEditor): Promise<void> {
        // const stringifiedEditorState = JSON.stringify(editor.getEditorState());
        // try {
        //     await fetch('http://localhost:1235/setEditorState', { // TODO
        //         body: stringifiedEditorState,
        //         headers: {
        //             Accept: 'application/json',
        //             'Content-type': 'application/json',
        //         },
        //         method: 'POST',
        //     });
        // } catch {
        //     // NO-OP
        // }

        setCurrentEditorState(editor.getEditorState())
        editor.setEditorState(editor.getEditorState())
    }

    async function validateEditorState(editor: LexicalEditor): Promise<void> {
        // const stringifiedEditorState = JSON.stringify(editor.getEditorState());
        // let response = null;
        // try {
        //     response = await fetch('http://localhost:1235/validateEditorState', { // TODO
        //         body: stringifiedEditorState,
        //         headers: {
        //             Accept: 'application/json',
        //             'Content-type': 'application/json',
        //         },
        //         method: 'POST',
        //     });
        // } catch {
        //     // NO-OP
        // }
        // if (response !== null && response.status === 403) {
        //     throw new Error(
        //         'Editor state validation failed! Server did not accept changes.',
        //     );
        // }

        if (currentEditorState !== editor.getEditorState()) {
            throw new Error('Editor state validation failed! Server did not accept changes.');
        }

        editor.setEditorState(editor.getEditorState())
        editor.update(() => {
            const root = $getRoot();
            sanitizeNode(root)
        })
        setCurrentEditorState(editor.getEditorState())
    }


    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) => {
                setIsEditable(editable);
            }),
            editor.registerCommand<boolean>(
                CONNECTED_COMMAND,
                (payload) => {
                    setConnected(payload);
                    return false;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(
            ({dirtyElements, prevEditorState, tags}) => {
                // If we are in read only mode, send the editor state
                // to server and ask for validation if possible.
                if (
                    !isEditable &&
                    dirtyElements.size > 0 &&
                    !tags.has('historic') &&
                    !tags.has('collaboration')
                ) {
                    validateEditorState(editor);
                }
                editor.getEditorState().read(() => {
                    const root = $getRoot();
                    const children = root.getChildren();

                    if (children.length > 1) {
                        setIsEditorEmpty(false);
                    } else {
                        if ($isParagraphNode(children[0])) {
                            const paragraphChildren = children[0].getChildren();
                            setIsEditorEmpty(paragraphChildren.length === 0);
                        } else {
                            setIsEditorEmpty(false);
                        }
                    }
                });
            },
        );
    }, [editor, isEditable]);

    const handleMarkdownToggle = useCallback(() => {
        editor.update(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
                $convertFromMarkdownString(
                    firstChild.getTextContent(),
                    TRANSFORMERS,
                );
            } else {
                const markdown = $convertToMarkdownString(TRANSFORMERS);
                root
                    .clear()
                    .append(
                        $createCodeNode('markdown').append($createTextNode(markdown)),
                    );
            }
            root.selectEnd();
        });
    }, [editor]);

    return (
        <div className="actions">
            {SUPPORT_SPEECH_RECOGNITION && (
                <button
                    onClick={() => {
                        editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
                        setIsSpeechToText(!isSpeechToText);
                    }}
                    className={
                        'action-button action-button-mic ' +
                        (isSpeechToText ? 'active' : '')
                    }
                    title="Speech To Text"
                    aria-label={`${
                        isSpeechToText ? 'Enable' : 'Disable'
                    } speech to text`}>
                    <i className="mic" />
                </button>
            )}
            <button
                className="action-button import"
                onClick={() => importFile(editor)}
                title="Import"
                aria-label="Import editor state from JSON">
                <i className="import" />
            </button>
            <button
                className="action-button export"
                onClick={() =>
                    exportFile(editor, {
                        fileName: `Playground ${new Date().toISOString()}`,
                        source: 'Playground',
                    })
                }
                title="Export"
                aria-label="Export editor state to JSON">
                <i className="export" />
            </button>
            <button
                className="action-button clear"
                disabled={isEditorEmpty}
                onClick={() => {
                    showModal('Clear editor', (onClose) => (
                        <ShowClearDialog editor={editor} onClose={onClose} />
                    ));
                }}
                title="Clear"
                aria-label="Clear editor contents">
                <i className="clear" />
            </button>
            <button
                className={`action-button ${!isEditable ? 'unlock' : 'lock'}`}
                onClick={() => {
                    // Send latest editor state to commenting validation server
                    if (isEditable) {
                        sendEditorState(editor);
                    }
                    editor.setEditable(!editor.isEditable());
                }}
                title="Read-Only Mode"
                aria-label={`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`}>
                <i className={!isEditable ? 'unlock' : 'lock'} />
            </button>
            <button
                className="action-button"
                onClick={handleMarkdownToggle}
                title="Convert From Markdown"
                aria-label="Convert from markdown">
                <i className="markdown" />
            </button>
            {isCollabActive && (
                <button
                    className="action-button connect"
                    onClick={() => {
                        editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
                    }}
                    title={`${
                        connected ? 'Disconnect' : 'Connect'
                    } Collaborative Editing`}
                    aria-label={`${
                        connected ? 'Disconnect from' : 'Connect to'
                    } a collaborative editing server`}>
                    <i className={connected ? 'disconnect' : 'connect'} />
                </button>
            )}
            {modal}
        </div>
    );
}

function ShowClearDialog({editor, onClose,}: { editor: LexicalEditor; onClose: () => void; }) {
    return (
        <>
            Are you sure you want to clear the editor?
            <div className="Modal__content">
                <Button
                    onClick={() => {
                        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                        editor.focus();
                        onClose();
                    }}>
                    Clear
                </Button>{' '}
                <Button
                    onClick={() => {
                        editor.focus();
                        onClose();
                    }}>
                    Cancel
                </Button>
            </div>
        </>
    );
}
