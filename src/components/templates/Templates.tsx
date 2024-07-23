import React from 'react';
import { observer } from 'mobx-react-lite';
import TemplateCard from './TemplateCard';
import { useMobXStores } from '@/context';

const Templates: React.FC = observer(() => {
    const {
        documentsTemplatesStore: { documentsTemplates },
    } = useMobXStores();

    return (
        <div className="tw-relative tw-flex tw-flex-col tw-gap-4">
            <section className="tw-flex tw-flex-col tw-m-2">
                {documentsTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </section>
        </div>
    );
});

export default Templates;
