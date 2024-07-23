import React from 'react';
import NewTemplateButton from './new-template-button';
import Templates from './Templates';

type Props = {};

const TemplatesIndex: React.FC<Props> = ({}) => {
    return (
        <div className="tw-flex tw-flex-col tw-relative tw-h-screen tw-w-full">
            <h1 className="tw-text-4xl tw-sticky tw-top-0 tw-z-[10] tw-p-6 tw-bg-background/50 tw-backdrop-blur-lg tw-flex tw-items-center tw-border-b tw-justify-between">
                Templates
                <NewTemplateButton />
            </h1>
            <Templates />
        </div>
    );
};

export default TemplatesIndex;
