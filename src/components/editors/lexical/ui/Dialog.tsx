import React from 'react';

type Props = Readonly<{
    children: React.ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
    return <div className="tw-flex tw-flex-col tw-justify-end tw-space-y-5">{children}</div>;
}

export function DialogActions({ children }: Props): JSX.Element {
    return <div className="tw-flex tw-flex-row tw-justify-end tw-mt-5">{children}</div>;
}
