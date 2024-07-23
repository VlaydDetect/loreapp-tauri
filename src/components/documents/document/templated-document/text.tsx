import React, { useMemo } from 'react';
import { EditorElement } from '@/components/templates-editor/types';

type Props = {
    element: EditorElement;
};

const TextComponent: React.FC<Props> = ({ element }) => {
    const styles = useMemo(() => element.styles, [element.styles]);

    // TODO: Update document
    const handleBlur: React.FocusEventHandler<HTMLSpanElement> = event => {
        const spanEl = event.target as HTMLSpanElement;
        const text = spanEl.innerText;
    };

    return (
        <div
            style={styles}
            className="tw-p-0.5 tw-w-full tw-m-[5px] tw-relative tw-text-[16px] tw-transition-all"
        >
            <span contentEditable onBlur={handleBlur}>
                {!Array.isArray(element.content) && element.content.innerText}
            </span>
        </div>
    );
};

export default TextComponent;
