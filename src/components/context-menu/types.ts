import React from 'react';

export type NodeBase = ({ key: React.Key } | { id: string }) & { [key: string]: any };
// | ({ key: React.Key } | { id: string });
// | { [key: string]: any };

type Separator = {
    type: 'separator';
};

export type ActionBase = {
    type: 'action';
    text: string;
    handler: <T extends NodeBase = NodeBase>(node?: T) => void;
};

export type Action = ActionBase | Separator;

export type TMouseEvent<T extends Element = Element> = React.MouseEvent<T, MouseEvent>;

export type ContextMenuProps<T extends NodeBase = NodeBase> = {
    actions: Action[];
    nodeActions: Action[];
    selectedNode: T | undefined;
    menuId?: string;
};

export type HookProps<N extends NodeBase = NodeBase, NN extends NodeBase = NodeBase> = {
    setSelectedNode: React.Dispatch<React.SetStateAction<N | undefined>>;
    nodeRightClickCallback: (node: NN) => N | undefined;
    elementRightClickCallback?: () => void;
    menuId?: string;
};

export type ItemProps<N extends NodeBase = NodeBase> = {
    node?: N;
};

export type ItemData = {
    action: ActionBase;
};

export const MENU_ID = 'context-menu-id';
