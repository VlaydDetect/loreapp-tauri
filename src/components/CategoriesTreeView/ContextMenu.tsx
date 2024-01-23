import React from 'react';
import {
    ACTIONS_IF_NODE_IS_SELECTED,
    ACTIONS_IF_NODE_IS_UNDEFINED,
    EMenuAction,
    TMouseEvent
} from "./types";
import {CategoryNode} from "@/interface";
import {Menu, MenuItem, PopoverPosition} from "@mui/material";

export const hideContextMenu = (setAnchorPosition: React.Dispatch<React.SetStateAction<PopoverPosition | undefined>>) => {
    setAnchorPosition(undefined);
};

export const showContextMenu = (
    event: TMouseEvent,
    node: CategoryNode | undefined,
    divRef: React.RefObject<HTMLDivElement>,
    setAnchorPosition: React.Dispatch<React.SetStateAction<PopoverPosition | undefined>>,
    setSelectedNode: React.Dispatch<React.SetStateAction<CategoryNode | undefined>>,
    setActions: React.Dispatch<React.SetStateAction<EMenuAction[]>>,
) => {
    event.preventDefault();
    event.stopPropagation();

    if (divRef.current && divRef.current.contains(event.target as Node)) {
        const mouseX = event.clientX + 2;
        const mouseY = event.clientY - 4;

        setAnchorPosition({ top: mouseY, left: mouseX });
        if (node) {
            setSelectedNode(node);
            setActions(ACTIONS_IF_NODE_IS_SELECTED);
        } else {
            setSelectedNode(undefined);
            setActions(ACTIONS_IF_NODE_IS_UNDEFINED);
        }
    } else {
        hideContextMenu(setAnchorPosition);
    }
};

export const handleMenuAction = (
    action: EMenuAction,
    node: CategoryNode | undefined,
    setAnchorPosition: React.Dispatch<React.SetStateAction<PopoverPosition | undefined>>,
    setSelectedAction: React.Dispatch<React.SetStateAction<EMenuAction | undefined>>,
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
    hideContextMenu(setAnchorPosition);

    setSelectedAction(action);
    setOpenModal(true);

    // if (node) {
    //     setSelectedAction(action);
    //
    //     // TODO: open modal, pre-list all the categories for comparing names (the name is the category id)
    //     //       or on each validation try to get a category by the entered name
    //     //       and if it was received then the entered name is not valid
    //
    //     setOpenModal(true);
    //     console.log(openModal)
    //
    //     switch (action) {
    //         case EMenuAction.Create: {
    //             // toggle modal menu
    //         }
    //         case EMenuAction.Rename: {
    //
    //         }
    //         case EMenuAction.Delete: {
    //
    //         }
    //     }
    // }
};

type TItemProps = {
    text: string, action: EMenuAction,
    selectedNode: CategoryNode | undefined,
    setAnchorPosition: React.Dispatch<React.SetStateAction<PopoverPosition | undefined>>,
    setSelectedAction: React.Dispatch<React.SetStateAction<EMenuAction | undefined>>,
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const Item: React.FC<TItemProps> = (
    {text,
        action,
        selectedNode,
        setAnchorPosition,
        setSelectedAction,
        setOpenModal
    }
) => (
    <MenuItem onClick={() => handleMenuAction(action, selectedNode, setAnchorPosition, setSelectedAction, setOpenModal)}>
        {text}
    </MenuItem>
)

type TMenuProps = {
    actions: EMenuAction[],
    selectedNode: CategoryNode | undefined,
    anchorPosition: PopoverPosition | undefined,
    setAnchorPosition: React.Dispatch<React.SetStateAction<PopoverPosition | undefined>>,
    setSelectedAction: React.Dispatch<React.SetStateAction<EMenuAction | undefined>>,
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ContextMenu: React.FC<TMenuProps> = (
    {
        actions,
        selectedNode,
        anchorPosition,
        setAnchorPosition,
        setSelectedAction,
        setOpenModal
    }
) => (
    <Menu anchorReference="anchorPosition" anchorPosition={anchorPosition} open={Boolean(anchorPosition)} onClose={() => hideContextMenu(setAnchorPosition)}>
        {actions.map(action => (
            <Item
                key={action.toString()}
                text={`${EMenuAction[action]}`.replace(/([a-z0-9])([A-Z])/g, "$1 $2") + " category"}
                selectedNode={selectedNode}
                action={action}
                setAnchorPosition={setAnchorPosition}
                setSelectedAction={setSelectedAction}
                setOpenModal={setOpenModal}
            />
        ))}
    </Menu>
)
