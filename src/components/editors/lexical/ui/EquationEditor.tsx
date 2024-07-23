import React, { ChangeEvent, forwardRef } from 'react';
import type { Ref, RefObject } from 'react';

type BaseEquationEditorProps = {
    equation: string;
    inline: boolean;
    setEquation: (equation: string) => void;
};

function EquationEditor(
    { equation, setEquation, inline }: BaseEquationEditorProps,
    forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
): JSX.Element {
    const onChange = (event: ChangeEvent) => {
        setEquation((event.target as HTMLInputElement).value);
    };

    return inline && forwardedRef instanceof HTMLInputElement ? (
        <span className="tw-bg-[#eee]">
            <span className="tw-text-left tw-text-[#b0b0b0]">$</span>
            <input
                className="tw-p-0 tw-m-0 tw-border-0 tw-outline-0 tw-text-[#8421a2] tw-bg-inherit tw-resize-none"
                value={equation}
                onChange={onChange}
                autoFocus
                ref={forwardedRef as RefObject<HTMLInputElement>}
            />
            <span className="tw-text-left tw-text-[#b0b0b0]">$</span>
        </span>
    ) : (
        <div className="tw-bg-[#eee]">
            <span className="tw-text-left tw-text-[#b0b0b0]">{'$$\n'}</span>
            <textarea
                className="tw-p-0 tw-m-0 tw-border-0 tw-outline-0 tw-text-[#8421a2] tw-bg-inherit tw-resize-none tw-w-full"
                value={equation}
                onChange={onChange}
                ref={forwardedRef as RefObject<HTMLTextAreaElement>}
            />
            <span className="tw-text-left tw-text-[#b0b0b0]">{'\n$$'}</span>
        </div>
    );
}

export default forwardRef(EquationEditor);
