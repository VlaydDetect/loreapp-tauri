import React from 'react';
import { Youtube } from 'lucide-react';
import { handlePlaceholderDragStart } from '@/components/templates-editor/editor-sidebar/tabs/components-tab/utils';

const VideoPlaceholder: React.FC = () => (
    <div
        className="tw-h-14 tw-w-14 tw-bg-muted tw-rounded-lg tw-flex tw-items-center tw-justify-center"
        draggable
        onDragStart={event => handlePlaceholderDragStart(event, 'video')}
    >
        <Youtube size={40} className="tw-text-muted-foreground" />
    </div>
);

export default VideoPlaceholder;
