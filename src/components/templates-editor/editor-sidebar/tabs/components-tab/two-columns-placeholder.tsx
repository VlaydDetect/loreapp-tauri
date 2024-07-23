import React from 'react';
import { handlePlaceholderDragStart } from './utils';

const TwoColumnsPlaceholder: React.FC = () => (
    <div
        className="tw-h-14 tw-w-14 tw-bg-muted/70 tw-rounded-lg tw-p-2 tw-flex tw-flex-row tw-gap-1"
        draggable
        onDragStart={event => handlePlaceholderDragStart(event, '2Col')}
    >
        <div className="tw-border-dashed tw-border-px tw-h-full tw-rounded-sm tw-bg-muted tw-border-muted-foreground/50 tw-w-full" />
        <div className="tw-border-dashed tw-border-px tw-h-full tw-rounded-sm tw-bg-muted tw-border-muted-foreground/50 tw-w-full" />
    </div>
);

export default TwoColumnsPlaceholder;
