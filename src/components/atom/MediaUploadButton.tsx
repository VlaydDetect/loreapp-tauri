import React from 'react';
import { useModal } from '@/context/ModalProvider';
import { Button, ButtonProps } from '@/components/ui/button';
import { DialogModal } from '@/components/atom/modal';
import UploadMediaFrom from '@/components/atom/UploadMediaFrom';

const MediaUploadButton: React.FC<Omit<ButtonProps, 'onClick'>> = props => {
    const { children, ...other } = props;
    const { setOpen } = useModal();

    const handleClick = () => {
        setOpen(
            <DialogModal title="Upload Media" subtitle="Upload a file to your media bucket">
                <UploadMediaFrom />
            </DialogModal>,
        );
    };

    return (
        <Button {...other} onClick={() => handleClick()}>
            {children}
        </Button>
    );
};

export default MediaUploadButton;
