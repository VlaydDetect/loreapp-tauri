import React from 'react';

import joinClasses from '../utils/joinClasses';

export default function Button({
    children,
    className,
    onClick,
    disabled,
    small,
    title,
}: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick: () => void;
    small?: boolean;
    title?: string;
}): JSX.Element {
    return (
        <button
            type="button"
            disabled={disabled}
            className={joinClasses(
                'tw-py-2.5 tw-px-[15px] tw-border-0 tw-bg-[#eee] tw-rounded-[5px] tw-cursor-pointer tw-text-[14px] hover:tw-bg-[#ddd]',
                disabled && 'tw-cursor-not-allowed hover:tw-bg-[#eee]',
                small && 'tw-py-[5px] tw-px-2.5',
                className,
            )}
            onClick={onClick}
            title={title}
            aria-label={title}
        >
            {children}
        </button>
    );
}
