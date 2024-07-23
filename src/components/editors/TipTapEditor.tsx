import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Menubar from './TipTap/Menubar';

const TipTapEditor = () => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
    });

    return (
        <div>
            {editor ? <Menubar editor={editor} /> : null}
            <EditorContent editor={editor} />
        </div>
    );
};

export default TipTapEditor;
