/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useEffect } from 'react';

import 'katex/dist/katex.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import {
    $createParagraphNode,
    $insertNodes,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    LexicalCommand,
    LexicalEditor,
} from 'lexical';

import { $createEquationNode, EquationNode } from './EquationNode';
import KatexEquationAlterer from '../ui/KatexEquationAlterer';

type CommandPayload = {
    equation: string;
    inline: boolean;
};

export const INSERT_EQUATION_COMMAND: LexicalCommand<CommandPayload> =
    createCommand('INSERT_EQUATION_COMMAND');

export const InsertEquationDialog = ({
    activeEditor,
    onClose,
}: {
    activeEditor: LexicalEditor;
    onClose: () => void;
}) => {
    const onEquationConfirm = useCallback(
        (equation: string, inline: boolean) => {
            activeEditor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
            onClose();
        },
        [activeEditor, onClose],
    );

    return <KatexEquationAlterer onConfirm={onEquationConfirm} />;
};

const EquationsPlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([EquationNode])) {
            throw new Error('EquationsPlugins: EquationsNode not registered on editor');
        }

        return editor.registerCommand<CommandPayload>(
            INSERT_EQUATION_COMMAND,
            payload => {
                const { equation, inline } = payload;
                const equationNode = $createEquationNode(equation, inline);

                $insertNodes([equationNode]);
                if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
                    $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
                }

                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
};

export default EquationsPlugin;
