import React, { useState } from 'react';
import { Action } from '@/components/context-menu/types';

type Props = {
    name: string;
    isRenaming: boolean;
    submitCallback: (newName: string) => void | Promise<void>;
    escapeCallback: () => void | Promise<void>;
};

const RenameInput: React.FC<Props> = ({ submitCallback, name, isRenaming, escapeCallback }) => {
    const [newName, setNewName] = useState(name);

    const handleKeyUp = async (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            submitCallback(newName);
        }

        if (event.key === 'Escape') {
            escapeCallback();
        }
    };

    return (
        <span>
            {isRenaming ? (
                <input
                    autoFocus
                    className="tw-h-full tw-w-1/2 tw-bg-transparent focus:tw-outline-none"
                    type="text"
                    value={newName}
                    onClick={event => event.stopPropagation()}
                    onFocus={event => event.target.select()}
                    onChange={event => setNewName(event.target.value)}
                    onKeyUp={handleKeyUp}
                />
            ) : (
                name
            )}
        </span>
    );
};

type Return = {
    idToRename: string | undefined;
    setIdToRename: React.Dispatch<React.SetStateAction<string | undefined>>;
    renameAction: Action;
    submitCallback: (newName: string) => void;
};

const useRenameInputs = (
    submitCallback?: (renamingId: string, newName: string) => void | Promise<void>,
): Return => {
    const [idToRename, setIdToRename] = useState<string | undefined>(undefined);

    const renameAction: Action = {
        type: 'action',
        text: 'Rename',
        handler: node => {
            if (node) {
                setIdToRename(node.id || (node.key as string) || undefined);
            }
        },
    };

    const innerSubmitCallback = (newName: string) => {
        if (submitCallback) {
            if (!idToRename) {
                throw new Error('Node to rename is undefined');
            }

            submitCallback(idToRename, newName);
        }
        setIdToRename(undefined);
    };

    return {
        idToRename,
        setIdToRename,
        renameAction,
        submitCallback: innerSubmitCallback,
    };
};

export { RenameInput, useRenameInputs };
