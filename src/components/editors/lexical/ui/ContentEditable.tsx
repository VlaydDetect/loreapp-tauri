import React from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

export default function LexicalContentEditable({ className }: { className?: string }): JSX.Element {
    return (
        <ContentEditable
            className={
                className ||
                'tw-border-0 tw-text-[15px] tw-block tw-relative tw-outline-0 tw-p-[8px_28px_40px] tw-min-h-[150px] lg-max:tw-pl-[8px] lg-max:tw-pr-[8px]'
            }
        />
    );
}
