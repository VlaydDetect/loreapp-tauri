import React, { useEffect, useState } from 'react';
import { Eye, Redo2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplatesEditor } from './editor-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn, JSONStringify } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMobXStores } from '@/context';

type Props = {
    templateId: string;
};

const EditorNavigation: React.FC<Props> = ({ templateId }) => {
    const {
        documentsTemplatesStore: { updateTemplateAsync, documentsTemplates },
    } = useMobXStores();
    const { state, dispatch } = useTemplatesEditor();
    const [templateName, setTemplateName] = useState(
        documentsTemplates.find(temp => temp.id === templateId)?.name || '',
    ); // TODO: templates counting

    useEffect(() => {
        dispatch({
            type: 'SET_TEMPLATE_ID',
            payload: { templateId },
        });
    }, [templateId, dispatch]);

    const handleOnBlurTitleChange: React.FocusEventHandler<HTMLInputElement> = async event => {
        if (event.target.value === templateName) return;

        if (event.target.value.length) {
            setTemplateName(event.target.value);
            toast('Success', { description: 'Saved Documents Template Title' });
        } else {
            toast('Oppse!', { description: 'You need to have a title!' });
            event.target.value = templateName;
        }
    };

    const handlePreviewClick = () => {
        dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
        dispatch({ type: 'TOGGLE_LIVE_MODE' });
    };

    const handleUndo = () => dispatch({ type: 'UNDO' });

    const handleRedo = () => dispatch({ type: 'REDO' });

    // TODO: save template
    const handleSave = async () => {
        try {
            const response = await updateTemplateAsync(templateId, {
                name: templateName,
                data: JSONStringify(state.editor.elements),
                description: null,
            });
            toast(`Template saved | ${response.name}`);
        } catch (error) {
            toast('Could not save Template', { description: error });
        }
    };

    return (
        <TooltipProvider>
            <nav
                className={cn(
                    'tw-border-b-px tw-flex tw-items-center tw-justify-between tw-p-4 tw-gap-2 tw-transition-all',
                    { 'tw-h-0 tw-p-0 tw-overflow-hidden': state.editor.previewMode },
                )}
            >
                <aside className="tw-flex tw-items-center tw-gap-4 tw-max-w-[260px] tw-w-[300px]">
                    <Input
                        defaultValue={templateName}
                        className="tw-border-none tw-h-5 tw-m-0 tw-p-0 tw-text-lg"
                        onBlur={handleOnBlurTitleChange}
                    />
                </aside>
                <aside className="tw-flex tw-items-center tw-gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:tw-bg-slate-800"
                        onClick={handlePreviewClick}
                    >
                        <Eye />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:tw-bg-slate-800"
                        disabled={!(state.history.currentIndex > 0)}
                        onClick={handleUndo}
                    >
                        <Undo2 />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:tw-bg-slate-800"
                        disabled={!(state.history.currentIndex < state.history.history.length - 1)}
                        onClick={handleRedo}
                    >
                        <Redo2 />
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </aside>
            </nav>
        </TooltipProvider>
    );
};

export default EditorNavigation;
