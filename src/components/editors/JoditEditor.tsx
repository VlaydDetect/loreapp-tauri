import { useState, useRef, useMemo } from "react";
import JoditEditor, {Jodit} from "jodit-react";
import {Config} from "jodit/types/config";

export const JoditTextEditor = () => {
    const editor = useRef<Jodit>(null)
    const [content, setContent] = useState('');

    return (
        <>
            <JoditEditor
                ref={editor}
                value={content}
                onChange={newContent => setContent(newContent)}
                onBlur={newContent => setContent(newContent)}
            />
            <div>{content}</div>
        </>
    );
};