import React from 'react';
import { cn } from '@/utils';
import { EditorElement } from '@/components/templates-editor/types';
import Recursive from '@/components/templates-editor/editor/components/recursive';

type Props = {
    element: EditorElement;
};

const Container: React.FC<Props> = ({ element }) => {
    return (
        <div
            style={element.styles}
            className={cn('tw-relative tw-p-4 tw-transition-all', {
                'tw-max-w-full tw-w-full': element.type === 'container' || element.type === '2Col',
                'tw-h-fit': element.type === 'container',
                'tw-h-full': element.type === '__body',
                'tw-overflow-scroll': element.type === '__body',
                'tw-flex tw-flex-col md:!tw-flex-row': element.type === '2Col',
            })}
        >
            {Array.isArray(element.content) &&
                element.content.map(childElement => (
                    <Recursive key={childElement.id} element={childElement} />
                ))}
        </div>
    );
};

export default Container;
