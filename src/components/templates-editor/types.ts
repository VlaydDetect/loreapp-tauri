import React from 'react';
import { EditorAction } from './editor-actions';

export type EditorBtns =
    | 'text'
    | 'container'
    | 'section'
    | '2Col'
    | '3Col'
    | 'video'
    | 'image'
    | '__body'
    | null;

export const defaultStyles: React.CSSProperties = {
    backgroundPosition: 'center',
    objectFit: 'cover',
    backgroundRepeat: 'no-repeat',
    textAlign: 'left',
    opacity: '100%',
};

export type EditorElement = {
    id: string;
    styles: React.CSSProperties;
    name: string;
    type: EditorBtns;
    // TODO: bind content object field to element type
    content: EditorElement[] | { innerText?: string; src?: string };
};

export type Editor = {
    liveMode: boolean;
    elements: EditorElement[];
    selectedElement: EditorElement;
    previewMode: boolean;
    templateId: string;
};

export type HistoryState = {
    history: Editor[];
    currentIndex: number;
};

export type EditorState = {
    editor: Editor;
    history: HistoryState;
};
