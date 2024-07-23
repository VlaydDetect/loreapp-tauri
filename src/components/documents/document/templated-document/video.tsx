import React from 'react';
import { EditorElement } from '@/components/templates-editor/types';

type Props = {
    element: EditorElement;
};

const Video: React.FC<Props> = ({ element }) => {
    return (
        <div
            style={element.styles}
            onClick={() => {}}
            className="tw-p-0.5 tw-w-full tw-m-[5px] tw-relative tw-text-[16px] tw-transition-all tw-flex tw-items-center tw-justify-center"
        >
            {!Array.isArray(element.content) && (
                <iframe
                    width={element.styles.width || '560'}
                    height={element.styles.height || '315'}
                    src={element.content.src}
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
            )}
        </div>
    );
};

export default Video;
