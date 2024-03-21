import React from 'react';
import {useModal} from "@/context/ModalProvider";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";

type Props = {
    title: string,
    subtitle: string,
    children: React.ReactNode,
    defaultOpen?: boolean,
}

const Modal: React.FC<Props> = ({title, subtitle, children, defaultOpen}) => {
    const { isOpen, setClose } = useModal();

    return (
        <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
            <DialogContent className="tw-overflow-scroll md:tw-max-h-[700px] md:tw-h-fit tw-h-screen tw-bg-card">
                <DialogHeader className="tw-pt-8 tw-text-left">
                    <DialogTitle className="tw-text-2xl tw-font-bold">{title}</DialogTitle>
                    <DialogDescription>{subtitle}</DialogDescription>
                    {children}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default Modal;