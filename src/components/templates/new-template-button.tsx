import React from 'react';
import { Plus } from 'lucide-react';
import { DrawerModal } from '@/components/atom/modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/ModalProvider';
import TemplateForm from './template-form';

const NewTemplateButton: React.FC = () => {
    const { setOpen } = useModal();

    const handleClick = () =>
        setOpen(
            <DrawerModal title="Create a New Template">
                <TemplateForm />
            </DrawerModal>,
        );

    return (
        <Button size="icon" onClick={handleClick}>
            <Plus />
        </Button>
    );
};

export default NewTemplateButton;
