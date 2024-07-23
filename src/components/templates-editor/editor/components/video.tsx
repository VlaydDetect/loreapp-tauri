import React from 'react';
import { Trash } from 'lucide-react';
import { useTemplatesEditor } from '@/components/templates-editor';
import { EditorBtns, EditorElement } from '@/components/templates-editor/types';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
    element: EditorElement;
};

const VideoComponent: React.FC<Props> = ({ element }) => {
    const { state, dispatch } = useTemplatesEditor();

    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData('componentType', type);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: {
                elementDetails: element,
            },
        });
    };

    const handleDelete = () => {
        dispatch({
            type: 'DELETE_ELEMENT',
            payload: { elementDetails: element },
        });
    };

    return (
        <div
            style={element.styles}
            draggable
            onDragStart={event => handleDragStart(event, 'video')}
            onClick={handleClick}
            className={cn(
                'tw-p-0.5 tw-w-full tw-m-[5px] tw-relative tw-text-[16px] tw-transition-all tw-flex tw-items-center tw-justify-center',
                {
                    'tw-border-blue-500': state.editor.selectedElement.id === element.id,
                    'tw-border-solid': state.editor.selectedElement.id === element.id,
                    'tw-border-dashed tw-border-px tw-border-slate-300': !state.editor.liveMode,
                },
            )}
        >
            {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
                <Badge className="tw-absolute -tw-top-[23px] -tw-left-px tw-rounded-none tw-rounded-t-lg">
                    {state.editor.selectedElement.name}
                </Badge>
            )}

            {!Array.isArray(element.content) && (
                <iframe
                    width={element.styles.width || '560'}
                    height={element.styles.height || '315'}
                    src={element.content.src}
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            )}

            {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
                <div className="tw-absolute tw-bg-primary tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold -tw-top-[25px] -tw-right-px tw-rounded-none tw-rounded-t-lg !tw-text-white">
                    <Trash className="tw-cursor-pointer" size={16} onClick={handleDelete} />
                </div>
            )}
        </div>
    );
};

export default VideoComponent;
