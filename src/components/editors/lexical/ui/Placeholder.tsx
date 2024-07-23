import React from 'react';

export default function Placeholder({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}): JSX.Element {
    return (
        <div
            className={
                className ||
                'tw-text-[15px] tw-text-[#999] tw-overflow-hidden tw-absolute tw-text-ellipsis tw-left-[28px] tw-right-[28px] tw-top-[8px] tw-select-none tw-whitespace-nowrap tw-inline-block tw-pointer-events-none lg-max:tw-left-[8px]'
            }
        >
            {children}
        </div>
    );
}
