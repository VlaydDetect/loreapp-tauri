import React, { useMemo } from 'react';
import { ContextMenuProps, ItemData, ItemProps, MENU_ID } from './types';
import { Menu, Item, Separator, ItemParams } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

const ContextMenu: React.FC<ContextMenuProps> = ({
    actions,
    nodeActions,
    selectedNode,
    menuId,
}) => {
    const activeActions = useMemo(() => {
        if (actions.length === 0 && nodeActions.length === 0) {
            throw new Error('one of `actions` or `nodeActions` must be specified');
        }

        return selectedNode ? nodeActions : actions;
    }, [selectedNode, actions, nodeActions]);

    const handleItemClick = ({ id, props, data }: ItemParams<ItemProps, ItemData>) => {
        if (!props || !data)
            throw new Error("ContextMenu: Menu's props or Item's data is undefined");

        const { action } = data;
        const { node } = props;
        action.handler(node);
    };

    return (
        <Menu id={menuId || MENU_ID}>
            {activeActions.map((action, idx) => {
                if (action.type === 'separator')
                    return <Separator key={`context-menu-separator-${idx}`} />;

                return (
                    <Item
                        key={`context-menu-item-${idx}`}
                        data={{ action }}
                        onClick={handleItemClick}
                        handlerEvent="onMouseUp"
                        closeOnClick
                    >
                        {action.text}
                    </Item>
                );
            })}
        </Menu>
    );
};

export default ContextMenu;
