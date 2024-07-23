import React from 'react';
import { DocumentsTemplate } from '@/interface';
import { TemplatesEditor } from '@/components/templates-editor';
import { EditorElement } from '@/components/templates-editor/editor-provider';

type Props = {
    template: DocumentsTemplate | undefined;
};

const TemplateView: React.FC<Props> = ({ template }) => {
    if (!template)
        return (
            <div>
                <p>Whoops! The template cannot be loaded or does not exists...</p>
            </div>
        );

    return (
        <TemplatesEditor
            templateId={template.id}
            elements={JSON.parse(template.data) as EditorElement[]}
        />
    );
};

export default TemplateView;
