import React from 'react';
import { useModal } from '@/context/ModalProvider';
import { Button, ButtonProps } from '@/components/ui/button';
import Modal from '@/components/atom/Modal';
import UploadMediaFrom from '@/components/atom/UploadMediaFrom';

const MediaUploadButton: React.FC<Omit<ButtonProps, 'onClick'>> = props => {
    const { setOpen } = useModal();

    const handleClick = () => {
        setOpen(
            <Modal title="Upload Media" subtitle="Upload a file to your media bucket">
                <UploadMediaFrom />
            </Modal>,
        );
    };

    return (
        <Button {...props} onClick={() => handleClick()}>
            Upload
        </Button>
    );
};

export default MediaUploadButton;
