import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function PortalImpl({
    onClose,
    children,
    title,
    closeOnClickOutside,
}: {
    children: ReactNode;
    closeOnClickOutside: boolean;
    onClose: () => void;
    title: string;
}) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modalRef.current !== null) {
            modalRef.current.focus();
        }
    }, []);

    useEffect(() => {
        let modalOverlayElement: HTMLElement | null = null;
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const clickOutsideHandler = (event: MouseEvent) => {
            const target = event.target;
            if (
                modalRef.current !== null &&
                !modalRef.current.contains(target as Node) &&
                closeOnClickOutside
            ) {
                onClose();
            }
        };
        const modelElement = modalRef.current;
        if (modelElement !== null) {
            modalOverlayElement = modelElement.parentElement;
            if (modalOverlayElement !== null) {
                modalOverlayElement.addEventListener('click', clickOutsideHandler);
            }
        }

        window.addEventListener('keydown', handler);

        return () => {
            window.removeEventListener('keydown', handler);
            if (modalOverlayElement !== null) {
                modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
            }
        };
    }, [closeOnClickOutside, onClose]);

    return (
        <div
            className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-fixed tw-inset-0 tw-bg-[rgb(40_40_40_/_0.6)] tw-flex-grow-0 tw-flex-shrink tw-z-[100]"
            role="dialog"
        >
            <div
                className="tw-p-5 tw-min-h-[100px] tw-min-w-[300px] tw-flex tw-flex-col tw-flex-grow-0 tw-bg-[#fff] tw-relative tw-shadow-[0_0_20px_0] tw-shadow-[#444] tw-rounded-[10px]"
                tabIndex={-1}
                ref={modalRef}
            >
                <h2 className="tw-text-[#444] tw-m-0 tw-pb-2.5 tw-border-b-[1px] tw-border-b-[#ccc]">
                    {title}
                </h2>
                <button
                    className="tw-border-0 tw-absolute tw-right-5 tw-rounded-[20px] tw-justify-center tw-items-center tw-flex tw-w-[30px] tw-h-[30px] tw-text-center tw-cursor-pointer tw-bg-[#eee] hover:tw-bg-[#ddd]"
                    aria-label="Close modal"
                    type="button"
                    onClick={onClose}
                >
                    X
                </button>
                <div className="tw-pt-5">{children}</div>
            </div>
        </div>
    );
}

export default function Modal({
    onClose,
    children,
    title,
    closeOnClickOutside = false,
}: {
    children: ReactNode;
    closeOnClickOutside?: boolean;
    onClose: () => void;
    title: string;
}): JSX.Element {
    return createPortal(
        <PortalImpl onClose={onClose} title={title} closeOnClickOutside={closeOnClickOutside}>
            {children}
        </PortalImpl>,
        document.body,
    );
}
