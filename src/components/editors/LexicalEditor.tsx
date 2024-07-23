import React from 'react';
import {
    LexicalComposer,
    InitialConfigType,
    InitialEditorStateType,
} from '@lexical/react/LexicalComposer';

import { SharedAutocompleteContext } from './lexical/context/SharedAutocompleteContext';
import { SharedHistoryContext } from './lexical/context/SharedHistoryContext';
import Editor from './lexical/Editor';
import EditorNodes from './lexical/EditorNodes';
import { TableContext } from './lexical/TablePlugin';
import BasicEditorTheme from './lexical/themes/PlaygroundEditorTheme';
import './lexical/lexical.css';

const LexicalEditor: React.FC<{ initialState: InitialEditorStateType }> = ({ initialState }) => {
    const initialConfig: InitialConfigType = {
        editorState: initialState,
        namespace: 'Documents Editor',
        nodes: [...EditorNodes],
        onError: (error: Error) => {
            throw error;
        },
        theme: BasicEditorTheme,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
                <TableContext>
                    <SharedAutocompleteContext>
                        <div className="tw-my-5 tw-mx-auto tw-rounded-[2px] tw-max-w-[1100px] tw-relative tw-text-black tw-leading-[1.7] tw-font-[400]">
                            <Editor />
                        </div>
                    </SharedAutocompleteContext>
                </TableContext>
            </SharedHistoryContext>
        </LexicalComposer>
    );
};

export default LexicalEditor;
