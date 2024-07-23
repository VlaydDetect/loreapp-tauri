import React from 'react';
import { v4 } from 'uuid';
import { Trash } from 'lucide-react';
import { useTemplatesEditor } from '@/components/templates-editor/editor-provider';
import { cn } from '@/utils';
import { EditorBtns, defaultStyles, EditorElement } from '@/components/templates-editor/types';
import { Badge } from '@/components/ui/badge';
import Recursive from '@/components/templates-editor/editor/components/recursive';

type Props = {
    element: EditorElement;
};

const ContainerComponent: React.FC<Props> = ({ element }) => {
    const { state, dispatch } = useTemplatesEditor();

    const handleOnDrop = (e: React.DragEvent) => {
        e.stopPropagation();

        const componentType = e.dataTransfer.getData('componentType') as EditorBtns;
        switch (componentType) {
            case 'text': {
                dispatch({
                    type: 'ADD_ELEMENT',
                    payload: {
                        containerId: element.id,
                        elementDetails: {
                            content: { innerText: 'Text Element' },
                            id: v4(),
                            name: 'Text',
                            styles: {
                                color: 'black',
                                ...defaultStyles,
                            },
                            type: 'text',
                        },
                    },
                });
                break;
            }
            case 'container': {
                dispatch({
                    type: 'ADD_ELEMENT',
                    payload: {
                        containerId: element.id,
                        elementDetails: {
                            content: [],
                            id: v4(),
                            name: 'Container',
                            styles: defaultStyles,
                            type: 'container',
                        },
                    },
                });
                break;
            }
            case 'video': {
                dispatch({
                    type: 'ADD_ELEMENT',
                    payload: {
                        containerId: element.id,
                        elementDetails: {
                            content: {
                                src: '',
                            },
                            id: v4(),
                            name: 'Vide0',
                            styles: {},
                            type: 'video',
                        },
                    },
                });
                break;
            }
            case 'image': {
                dispatch({
                    type: 'ADD_ELEMENT',
                    payload: {
                        containerId: element.id,
                        elementDetails: {
                            content: {
                                src: '',
                            },
                            id: v4(),
                            name: 'Image',
                            styles: {},
                            type: 'image',
                        },
                    },
                });
                break;
            }
            case '2Col': {
                dispatch({
                    type: 'ADD_ELEMENT',
                    payload: {
                        containerId: element.id,
                        elementDetails: {
                            content: [
                                {
                                    content: [],
                                    id: v4(),
                                    name: 'Column 1',
                                    styles: { ...defaultStyles, width: '100%' },
                                    type: 'container',
                                },
                                {
                                    content: [],
                                    id: v4(),
                                    name: 'Column 2',
                                    styles: { ...defaultStyles, width: '100%' },
                                    type: 'container',
                                },
                            ],
                            id: v4(),
                            name: 'Two Columns',
                            styles: { ...defaultStyles, display: 'flex' },
                            type: '2Col',
                        },
                    },
                });
                break;
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // TODO: When drop its cloning element with this type. Send other element details from here and make completely 'cloning' action.
    const handleDragStart = (e: React.DragEvent, type: string) => {
        if (type === '__body') return;
        e.dataTransfer.setData('componentType', type);
    };

    const handleBodyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: {
                elementDetails: element,
            },
        });
    };

    const handleDeleteElement = () => {
        dispatch({
            type: 'DELETE_ELEMENT',
            payload: {
                elementDetails: element,
            },
        });
    };

    return (
        <div
            style={element.styles}
            className={cn('tw-relative tw-p-4 tw-transition-all', {
                'tw-max-w-full tw-w-full': element.type === 'container' || element.type === '2Col',
                'tw-h-fit': element.type === 'container',
                'tw-h-full': element.type === '__body',
                'tw-overflow-scroll': element.type === '__body',
                'tw-flex tw-flex-col md:!tw-flex-row': element.type === '2Col',
                'tw-border-blue-500':
                    state.editor.selectedElement.id === element.id &&
                    !state.editor.liveMode &&
                    state.editor.selectedElement.type !== '__body',
                'tw-border-yellow-400 tw-border-4':
                    state.editor.selectedElement.id === element.id &&
                    !state.editor.liveMode &&
                    state.editor.selectedElement.type === '__body',
                'tw-border-solid':
                    state.editor.selectedElement.id === element.id && !state.editor.liveMode,
                'tw-border-dashed tw-border-px tw-border-slate-300': !state.editor.liveMode,
            })}
            onDrop={handleOnDrop}
            onDragOver={handleDragOver}
            draggable={element.type !== '__body'}
            onDragStart={event => handleDragStart(event, 'container')}
            onClick={handleBodyClick}
        >
            <Badge
                className={cn(
                    'tw-absolute -tw-top-[23px] -tw-left-px tw-rounded-none tw-rounded-t-lg tw-hidden',
                    {
                        'tw-block':
                            state.editor.selectedElement.id === element.id &&
                            !state.editor.liveMode,
                    },
                )}
            >
                {element.name}
            </Badge>

            {Array.isArray(element.content) &&
                element.content.map(childElement => (
                    <Recursive key={childElement.id} element={childElement} />
                ))}

            {state.editor.selectedElement.id === element.id &&
                !state.editor.liveMode &&
                state.editor.selectedElement.type !== '__body' && (
                    <div className="tw-absolute tw-bg-primary tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold -tw-top-[25px] -tw-right-px tw-rounded-none tw-rounded-t-lg">
                        <Trash size={16} onClick={handleDeleteElement} />
                    </div>
                )}
        </div>
    );
};

export default ContainerComponent;
