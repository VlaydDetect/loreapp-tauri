import React, { Dispatch, createContext, useContext, useEffect, useReducer } from 'react';
import { EditorNodeType, Edge, EditorActions } from './types';

export type FlowNode = EditorNodeType;

export type FlowEditor = {
    elements: FlowNode[];
    edges: Edge[];
    selectedNode: EditorNodeType | undefined;
};

export type HistoryState = {
    history: FlowEditor[];
    currentIndex: number;
};

export type EditorState = {
    editor: FlowEditor;
    history: HistoryState;
};

const initialEditorState: FlowEditor = {
    elements: [],
    selectedNode: undefined,
    edges: [],
};

const initialHistoryState: HistoryState = {
    history: [initialEditorState],
    currentIndex: 0,
};

const initialState: EditorState = {
    editor: initialEditorState,
    history: initialHistoryState,
};

const editorReducer = (state: EditorState = initialState, action: EditorActions): EditorState => {
    switch (action.type) {
        case 'REDO':
            if (state.history.currentIndex < state.history.history.length - 1) {
                const nextIndex = state.history.currentIndex + 1;
                const nextEditorState = { ...state.history.history[nextIndex] };
                const redoState = {
                    ...state,
                    editor: nextEditorState,
                    history: {
                        ...state.history,
                        currentIndex: nextIndex,
                    },
                };
                return redoState;
            }
            return state;

        case 'UNDO':
            if (state.history.currentIndex > 0) {
                const prevIndex = state.history.currentIndex - 1;
                const prevEditorState = { ...state.history.history[prevIndex] };
                const undoState = {
                    ...state,
                    editor: prevEditorState,
                    history: {
                        ...state.history,
                        currentIndex: prevIndex,
                    },
                };
                return undoState;
            }
            return state;

        case 'LOAD_DATA':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    elements: action.payload.elements || initialEditorState.elements,
                    edges: action.payload.edges,
                },
            };
        case 'SELECTED_ELEMENT':
            return {
                ...state,
                editor: {
                    ...state.editor,
                    selectedNode: action.payload.element,
                },
            };
        default:
            return state;
    }
};

export type EditorContextData = {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
};

export const EditorContext = createContext<{
    state: EditorState;
    dispatch: Dispatch<EditorActions>;
}>({
    state: initialState,
    dispatch: () => undefined,
});

type Props = {
    children: React.ReactNode;
};

const FlowProvider: React.FC<Props> = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
};

export const useFlowEditor = () => {
    const context = useContext(EditorContext);

    if (!context) {
        throw new Error('useFlowEditor Hook must be used within the flow editor Provider');
    }

    return context;
};

export default FlowProvider;
