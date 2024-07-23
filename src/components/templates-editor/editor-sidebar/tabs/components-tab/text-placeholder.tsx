import React from 'react';
import { Type } from 'lucide-react';
import { handlePlaceholderDragStart } from './utils';

const TextPlaceholder: React.FC = () => (
    <div
        className="tw-h-14 tw-w-14 tw-bg-muted tw-rounded-lg tw-flex tw-items-center tw-justify-center"
        draggable
        onDragStart={event => handlePlaceholderDragStart(event, 'text')}
    >
        <Type size={40} className="tw-text-muted-foreground" />
    </div>
);

export default TextPlaceholder;
