import { useEffect } from 'react';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { isMimeType, mediaFileReader } from '@lexical/utils';

import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp'];

export default function DragDropPaste(): null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            DRAG_DROP_PASTE,
            files => {
                (async () => {
                    const filesResult = await mediaFileReader(
                        files,
                        [ACCEPTABLE_IMAGE_TYPES].flatMap(x => x),
                    );

                    filesResult.forEach(({ file, result }) => {
                        if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                altText: file.name,
                                src: result,
                            });
                        }
                    });
                })();
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);
    return null;
}
