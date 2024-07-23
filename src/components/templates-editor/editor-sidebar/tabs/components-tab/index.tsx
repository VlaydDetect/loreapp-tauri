import React from 'react';
import { EditorBtns } from '@/components/templates-editor/types';
import {
    Accordion,
    AccordionItem,
    AccordionContent,
    AccordionTrigger,
} from '@/components/ui/accordion';
import TextPlaceholder from './text-placeholder';
import ContainerPlaceholder from './container-placeholder';
import VideoPlaceholder from './video-placeholder';
import TwoColumnsPlaceholder from './two-columns-placeholder';

type Element = {
    Component: React.ReactNode;
    label: string;
    id: EditorBtns;
    group: 'layout' | 'elements';
};

const ComponentsTab: React.FC = () => {
    const elements: Element[] = [
        // Elements
        {
            Component: <TextPlaceholder />,
            label: 'Text',
            id: 'text',
            group: 'elements',
        },
        {
            Component: <VideoPlaceholder />,
            label: 'Video',
            id: 'video',
            group: 'elements',
        },

        // Layout
        {
            Component: <ContainerPlaceholder />,
            label: 'Container',
            id: 'container',
            group: 'layout',
        },
        {
            Component: <TwoColumnsPlaceholder />,
            label: '2 Columns',
            id: '2Col',
            group: 'layout',
        },
    ];

    return (
        <Accordion type="multiple" className="tw-w-full" defaultValue={['Layout', 'Elements']}>
            <AccordionItem value="Layout" className="tw-px-6 tw-py-0 tw-border-y-px">
                <AccordionTrigger className="!tw-no-underline">Layout</AccordionTrigger>
                <AccordionContent className="tw-flex tw-flex-wrap tw-gap-2">
                    {elements
                        .filter(elem => elem.group === 'layout')
                        .map(elem => (
                            <div
                                key={elem.id}
                                className="tw-flex tw-flex-col tw-items-center tw-justify-center"
                            >
                                {elem.Component}
                                <span className="tw-text-muted-foreground">{elem.label}</span>
                            </div>
                        ))}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="Elements" className="tw-px-6 tw-py-0">
                <AccordionTrigger className="!tw-no-underline">Elements</AccordionTrigger>
                <AccordionContent className="tw-flex tw-flex-wrap tw-gap-2">
                    {elements
                        .filter(elem => elem.group === 'elements')
                        .map(elem => (
                            <div
                                key={elem.id}
                                className="tw-flex tw-flex-col tw-items-center tw-justify-center"
                            >
                                {elem.Component}
                                <span className="tw-text-muted-foreground">{elem.label}</span>
                            </div>
                        ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ComponentsTab;
