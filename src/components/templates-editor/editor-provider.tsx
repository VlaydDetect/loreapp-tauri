import React, { createContext, Dispatch, useReducer } from 'react';
import { EditorBtns } from './types';
import { EditorAction } from './editor-actions';

export type EditorElement = {
    id: string;
    styles: React.CSSProperties;
    name: string;
    type: EditorBtns;
    content: EditorElement[] | {};
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

const initialEditorState: Editor = {
    elements: [
        {
            content: [],
            id: '__body',
            name: 'Body',
            styles: {},
            type: '__body',
        },
    ],
    selectedElement: {
        id: '',
        content: [],
        name: '',
        styles: {},
        type: null,
    },
    previewMode: false,
    liveMode: false,
    templateId: '',
};

const initialHistoryState: HistoryState = {
    history: [initialEditorState],
    currentIndex: 0,
};

const initialState: EditorState = {
    editor: initialEditorState,
    history: initialHistoryState,
};

const addAnElement = (elements: EditorElement[], action: EditorAction): EditorElement[] => {
    if (action.type !== 'ADD_ELEMENT') {
        throw new Error('You sent the wrong action type to the Add Element editor State');
    }

    return elements.map(item => {
        if (item.id === action.payload.containerId && Array.isArray(item.content)) {
            return {
                ...item,
                content: [...item.content, action.payload.elementDetails],
            };
        }
        if (item.content && Array.isArray(item.content)) {
            return {
                ...item,
                content: addAnElement(item.content, action),
            };
        }

        return item;
    });
};

const updateAnElement = (elements: EditorElement[], action: EditorAction): EditorElement[] => {
    if (action.type !== 'UPDATE_ELEMENT') {
        throw new Error('You sent the wrong action type to the Update Element State');
    }

    return elements.map(item => {
        if (item.id === action.payload.elementDetails.id) {
            return { ...item, ...action.payload.elementDetails };
        }
        if (item.content && Array.isArray(item.content)) {
            return {
                ...item,
                content: updateAnElement(item.content, action),
            };
        }

        return item;
    });
};

const deleteAnAlement = (elements: EditorElement[], action: EditorAction): EditorElement[] => {
    if (action.type !== 'DELETE_ELEMENT') {
        throw new Error('You sent the wrong action type to the Delete Element editor State');
    }

    return elements.filter(item => {
        if (item.id === action.payload.elementDetails.id) {
            return false;
        }
        if (item.content && Array.isArray(item.content)) {
            item.content = deleteAnAlement(item.content, action);
        }

        return true;
    });
};

const editorReducer = (state: EditorState = initialState, action: EditorAction): EditorState => {
    switch (action.type) {
        case 'ADD_ELEMENT': {
            const updatedEditorState: Editor = {
                ...state.editor,
                elements: addAnElement(state.editor.elements, action),
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditorState },
            ];

            const newEditorState = {
                ...state,
                editor: updatedEditorState,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return newEditorState;
        }
        case 'UPDATE_ELEMENT': {
            const updatedElements = updateAnElement(state.editor.elements, action);

            const updatedElementIsSelected =
                state.editor.selectedElement.id === action.payload.elementDetails.id;

            const updatedEditorState = {
                ...state.editor,
                elements: updatedElements,
                selectedElement: updatedElementIsSelected
                    ? action.payload.elementDetails
                    : {
                          id: '',
                          content: [],
                          name: '',
                          styles: {},
                          type: null,
                      },
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditorState },
            ];

            const updatedEditor = {
                ...state,
                editor: updatedEditorState,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return updatedEditor;
        }
        case 'DELETE_ELEMENT': {
            const updatedElements = deleteAnAlement(state.editor.elements, action);

            const updatedEditorState = {
                ...state.editor,
                elements: updatedElements,
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditorState },
            ];

            const updatedEditor = {
                ...state,
                editor: updatedEditorState,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return updatedEditor;
        }
        case 'CHANGE_CLICKED_ELEMENT': {
            const updatedEditor = {
                ...state,
                editor: {
                    ...state.editor,
                    selectedElement: action.payload.elementDetails || {
                        id: '',
                        content: [],
                        name: '',
                        styles: {},
                        type: null,
                    },
                },
                history: {
                    ...state.history,
                    history: [
                        ...state.history.history.slice(0, state.history.currentIndex + 1),
                        // TODO: should UNDO and REDO actions take into account the selection of the element or not?
                        // TODO: if true, then we must store updated editor state here
                        { ...state.editor },
                    ],
                    currentIndex: state.history.currentIndex + 1,
                },
            };

            return updatedEditor;
        }
        case 'TOGGLE_PREVIEW_MODE': {
            const updatedEditor = {
                ...state,
                editor: {
                    ...state.editor,
                    previewMode: !state.editor.previewMode,
                },
            };

            return updatedEditor;
        }
        case 'TOGGLE_LIVE_MODE': {
            const updatedEditor = {
                ...state,
                editor: {
                    ...state.editor,
                    liveMode: action.payload ? action.payload.value : !state.editor.liveMode,
                },
            };

            return updatedEditor;
        }
        case 'REDO': {
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
        }
        case 'UNDO': {
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
        }
        case 'LOAD_DATA': {
            return {
                ...state,
                editor: {
                    ...state.editor,
                    elements: action.payload.elements || state.editor.elements,
                    liveMode: action.payload.withLive,
                },
            };
        }
        case 'SET_TEMPLATE_ID': {
            const { templateId } = action.payload;

            const updatedEditorState = {
                ...state.editor,
                templateId,
            };

            const updatedHistory = [
                ...state.history.history.slice(0, state.history.currentIndex + 1),
                { ...updatedEditorState },
            ];

            const updatedEditor = {
                ...state,
                editor: updatedEditorState,
                history: {
                    ...state.history,
                    history: updatedHistory,
                    currentIndex: updatedHistory.length - 1,
                },
            };

            return updatedEditor;
        }
        default:
            return state;
    }
};

export type EditorContextData = {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
};

export type EditorContextType = {
    state: EditorState;
    dispatch: Dispatch<EditorAction>;
    templateId: string;
};

export const EditorContext = createContext<EditorContextType>({
    state: initialState,
    dispatch: () => undefined,
    templateId: '',
});

type Props = {
    children: React.ReactNode;
    templateId: string;
};

const TemplatesEditorProvider: React.FC<Props> = ({ children, templateId }) => {
    const [state, disparch] = useReducer(editorReducer, initialState);
};
