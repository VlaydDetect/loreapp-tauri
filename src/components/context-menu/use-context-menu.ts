import { HookProps, ItemProps, MENU_ID, NodeBase, TMouseEvent } from './types';
import { useContextMenu as _useContextMenu } from 'react-contexify';

/**
 * @template T - The element of which your component is a child element
 * @template N - Your Node Type
 * @template NN - Passed Node Type
 * @param setSelectedNode
 * @param elementRightClickCallback - do something with the element
 * @param nodeRightClickCallback - convert passed node type to your node type
 * @param menuId - Menu ID
 */
const useContextMenu = <
    T extends HTMLElement = HTMLElement,
    N extends NodeBase = NodeBase,
    NN extends NodeBase = NodeBase,
>({
    setSelectedNode,
    elementRightClickCallback,
    nodeRightClickCallback,
    menuId,
}: HookProps<N, NN>) => {
    const { show } = _useContextMenu({
        id: menuId || MENU_ID,
    });

    const displayMenu = (e: TMouseEvent, node?: N) => {
        e.preventDefault();
        e.stopPropagation();

        if (setSelectedNode) {
            setSelectedNode(node);
        }

        show({
            event: e,
            props: {
                node,
            } as ItemProps<N>,
            position: {
                x: e.clientX + 2,
                y: e.clientY - 4,
            },
        });
    };

    // TODO: don't show menu when actions array is empty
    const handleElementContentMenu = (event: TMouseEvent<T>) => {
        if (elementRightClickCallback) {
            elementRightClickCallback();
        }
        displayMenu(event);
    };

    const handleNodeContentMenu = (event: TMouseEvent, node: NN) => {
        // console.log(event.currentTarget); // TODO: maybe center relative to element

        const newNode = nodeRightClickCallback(node);
        displayMenu(event, newNode);
    };

    return {
        handleElementContentMenu,
        handleNodeContentMenu,
    };
};

export default useContextMenu;
