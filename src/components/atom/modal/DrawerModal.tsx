import React from 'react';
import { useModal } from '@/context/ModalProvider';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

type Props = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

const DrawerModal: React.FC<Props> = ({ title, subtitle, children, defaultOpen }) => {
    const { isOpen, setClose } = useModal();

    const handleClose = () => setClose();

    return (
        <Drawer open={isOpen || defaultOpen} onClose={handleClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="tw-text-center">{title}</DrawerTitle>
                    <DrawerDescription className="tw-flex tw-flex-col tw-text-center tw-items-center tw-gap-4 tw-h-96 tw-overflow-y-auto">
                        {subtitle || null}
                        {children}
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="tw-flex tw-flex-col tw-gap-4 tw-bg-background tw-border-t-[1px] tw-border-t-muted">
                    <DrawerClose>
                        <Button variant="ghost" className="tw-w-full" onClick={handleClose}>
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default DrawerModal;
