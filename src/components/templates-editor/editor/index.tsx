import React, { useEffect } from 'react';
import { EyeOff } from 'lucide-react';
import { useTemplatesEditor } from '../editor-provider';
import { EditorElement } from '../types';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import Recursive from '@/components/templates-editor/editor/components/recursive';

type Props = {
    liveMode: boolean;
    elements?: EditorElement[];
};

const Editor: React.FC<Props> = ({ liveMode, elements }) => {
    const { state, dispatch } = useTemplatesEditor();

    useEffect(() => {
        if (liveMode) {
            dispatch({
                type: 'TOGGLE_LIVE_MODE',
                payload: { value: true },
            });
        }
    }, [liveMode, dispatch]);

    useEffect(() => {
        // TODO: load data
        dispatch({
            type: 'LOAD_DATA',
            payload: {
                elements: elements || [],
                withLive: liveMode,
            },
        });
    }, [liveMode, dispatch, elements]);

    const handleClick = () => {
        dispatch({
            type: 'CHANGE_CLICKED_ELEMENT',
            payload: {},
        });
    };

    const handleUnpreview = () => {
        dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
        dispatch({ type: 'TOGGLE_LIVE_MODE' });
    };

    return (
        <div
            className={cn(
                'use-automation-zoom-in tw-h-full tw-w-full tw-overflow-scroll tw-mr-[385px] tw-bg-background tw-transition-all tw-rounded-md',
                { 'tw-p-0, tw-mr-0': state.editor.previewMode || state.editor.liveMode },
            )}
            onClick={handleClick}
        >
            {state.editor.previewMode && state.editor.liveMode && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="tw-w-6 tw-h-6 tw-bg-slate-600 tw-p-0.5 tw-m-4 tw-fixed tw-z-[100]"
                    onClick={handleUnpreview}
                >
                    <EyeOff />
                </Button>
            )}

            {Array.isArray(state.editor.elements) &&
                state.editor.elements.map(childElement => (
                    <Recursive key={childElement.id} element={childElement} />
                ))}
        </div>
    );
};

export default Editor;
