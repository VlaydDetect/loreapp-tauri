import React, {useEffect, useState} from "react";

interface ModalProviderProps {
    children: React.ReactNode
}

export type ModalData = {};

type ModalContextType = {
    data: ModalData,
    isOpen: boolean,
    setOpen: (modal: React.ReactNode, fetchData?: <T>() => Promise<T>) => void,
    setClose: () => void,
};

export const ModalContent = React.createContext<ModalContextType>({
    data: {},
    isOpen: false,
    setOpen: (modal, fetchData?) => {},
    setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<ModalData>({});
    const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const setOpen: ModalContextType['setOpen'] = async (modal, fetchData?) => {
        if (modal) {
            if (fetchData) {
                setData({...data, ...(await fetchData())});
            }
            setShowingModal(modal);
            setIsOpen(true);
        }
    }

    const setClose = () => {
        setIsOpen(false);
        setData({});
    }

    if (!isMounted) return null;

    return (
        <ModalContent.Provider value={{data, isOpen, setOpen, setClose}}>
            {children}
            {showingModal}
        </ModalContent.Provider>
    );
}

export const useModal = () => {
    const context = React.useContext(ModalContent);

    if (!context) {
        throw new Error('useModal must be used within the modal provider');
    }

    return context;
}

export default ModalProvider;
