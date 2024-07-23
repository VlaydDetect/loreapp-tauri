import React from 'react';
import TemplatesEditorProvider from './editor-provider';
import { EditorElement } from './types';
import EditorNavigation from './editor-navigation';
import EditorSidebar from './editor-sidebar';
import Editor from './editor/index';

type Props = {
    templateId: string;
    elements?: EditorElement[];
};

const TemplatesEditor: React.FC<Props> = ({ templateId, elements }) => {
    return (
        <div className="tw-h-screen tw-w-full tw-z-[20] tw-bg-background tw-overflow-hidden">
            <TemplatesEditorProvider templateId={templateId}>
                <EditorNavigation templateId={templateId} />

                <div className="tw-h-full tw-flex tw-justify-center">
                    <Editor liveMode={false} elements={elements} />
                </div>

                <EditorSidebar />
            </TemplatesEditorProvider>
        </div>
    );
};

export default TemplatesEditor;
