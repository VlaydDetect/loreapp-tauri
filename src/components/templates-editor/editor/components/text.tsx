import React, { useMemo } from 'react';
import { Trash } from 'lucide-react';
import { useTemplatesEditor } from '@/components/templates-editor/editor-provider';
import { EditorElement } from '@/components/templates-editor/types';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
    element: EditorElement;
};

const TextComponent: React.FC<Props> = ({ element }) => {
    const { state, dispatch } = useTemplatesEditor();

    const styles = useMemo(() => element.styles, [element.styles]);

    const handleBodyClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: {
                elementDetails: element,
            },
        });
    };

    const handleBlur: React.FocusEventHandler<HTMLSpanElement> = event => {
        const spanEl = event.target as HTMLSpanElement;
        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                elementDetails: {
                    ...element,
                    content: {
                        innerText: spanEl.innerText,
                    },
                },
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
            style={styles}
            className={cn(
                'tw-p-0.5 tw-w-full tw-m-[5px] tw-relative tw-text-[16px] tw-transition-all',
                {
                    'tw-border-blue-500': state.editor.selectedElement.id === element.id,
                    'tw-border-solid': state.editor.selectedElement.id === element.id,
                    'tw-border-dashed tw-border-px tw-border-slate-300': !state.editor.liveMode,
                },
            )}
            onClick={handleBodyClick}
        >
            {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
                <Badge className="tw-absolute -tw-top-[23px] -tw-left-px tw-rounded-none tw-rounded-t-lg">
                    {state.editor.selectedElement.name}
                </Badge>
            )}

            <span contentEditable={!state.editor.liveMode} onBlur={handleBlur}>
                {!Array.isArray(element.content) && element.content.innerText}
            </span>

            {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
                <div className="tw-absolute tw-bg-primary tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold -tw-top-[25px] -tw-right-px tw-rounded-none tw-rounded-t-lg !tw-text-white">
                    <Trash className="tw-cursor-pointer" size={16} onClick={handleDelete} />
                </div>
            )}
        </div>
    );
};

export default TextComponent;
