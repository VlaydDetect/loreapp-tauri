import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DocumentsTemplate } from '@/interface';
import { docsTemplateFmc } from '@/db';
import Spinner from '@/components/atom/Spinner';
import TemplateView from '@/components/templates/TemplateView';

const TemplateWrapper: React.FC = () => {
    const { templateId } = Route.useParams();
    const [template, setTemplate] = useState<DocumentsTemplate>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (templateId) {
            docsTemplateFmc
                .get(templateId)
                .then(temp => setTemplate(temp))
                .finally(() => setLoading(false));
        }
    }, [templateId]);

    if (loading) {
        return <Spinner />;
    }

    return <TemplateView template={template} />;
};

export const Route = createFileRoute('/tabs/$tabId/templates/$templateId')({
    component: TemplateWrapper,
});
