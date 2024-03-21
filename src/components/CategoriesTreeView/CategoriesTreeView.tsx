import React, { useMemo, useRef, useState } from 'react';

import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { EventDataNode } from 'antd/lib/tree';

import { observer } from 'mobx-react-lite';

import { CategoryNode } from '@/interface';
import { useMobXStores } from '@/context/mobx-context';
import { ContextMenu, useContextMenu, Action } from '@/components/context-menu';
import { RenameInput, useRenameInputs } from '@/components/atom/RenameInput';

import { Input } from '@/components/ui/input';

// const { Search } = Input;

type TProps = {
    doubleClickHandler: (node: CategoryNode) => void;
};

const CategoriesTreeView: React.FC<TProps> = observer(({ doubleClickHandler }) => {
    const {
        tagsAndCategoriesStore: {
            categoriesTree,
            categories,
            createNewCategory,
            createAndAttachNewCategory,
            renameCategory,
            deleteCategory,
            findCategoryById,
            findParent,
            reattachCategory,
        },
    } = useMobXStores();

    const [selectedNode, setSelectedNode] = useState<CategoryNode | undefined>(undefined);

    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchExpandedKeys, setSearchExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const { handleElementContentMenu, handleNodeContentMenu } = useContextMenu<
        HTMLDivElement,
        CategoryNode,
        EventDataNode<TreeDataNode>
    >({
        menuId: 'categories-tree-menu',
        setSelectedNode,
        nodeRightClickCallback: node => findCategoryById(node.key as string),
    });

    const { idToRename, setIdToRename, renameAction, submitCallback } = useRenameInputs(
        (renamingId, newName) => renameCategory(renamingId, newName),
    );

    const treeData = useMemo(() => {
        const loop = (data: CategoryNode[]): TreeDataNode[] =>
            data.map(item => {
                if (item.children) {
                    return { title: item.name, key: item.id, children: loop(item.children) };
                }

                return {
                    title: item.name,
                    key: item.id,
                };
            });

        if (categoriesTree.nodes.length > 0) {
            return loop(categoriesTree.nodes);
        }
        return [];
    }, [categoriesTree.nodes]);

    const divRef = useRef<HTMLDivElement>(null);

    //#region -------------------------- Handlers --------------------------
    const handleDoubleClick: TreeProps['onDoubleClick'] = () => {
        if (selectedNode) {
            doubleClickHandler(selectedNode);
        }
    };
    const handleDrop: TreeProps['onDrop'] = event => {
        const { dragNode, node: dropNode } = event;
        const parent = findParent(dragNode.key as string);

        reattachCategory(
            dragNode.key as string,
            parent?.id,
            event.dropToGap ? undefined : (dropNode.key as string),
        );
    };

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        const newExpandedKeys = categories
            .map(item => {
                if (item.name.indexOf(value) > -1) {
                    const parent = findParent(item.id);
                    if (parent) return parent.id;
                }
                return undefined;
            })
            .filter((item, i, self): item is string => !!(item && self.indexOf(item) === i));
        setSearchExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };
    //#endregion -------------------------- Handlers --------------------------

    const titleRender = (node: TreeDataNode) => {
        const titleStr = node.title as string;
        const index = titleStr.indexOf(searchValue);
        const before = titleStr.substring(0, index);
        const after = titleStr.slice(index + searchValue.length);
        const title =
            index > -1 ? (
                <span>
                    {before}
                    <span className="tw-text-[#f50]">{searchValue}</span>
                    {after}
                </span>
            ) : (
                <span>{titleStr}</span>
            );

        return idToRename ? (
            <RenameInput
                isRenaming={(node.key as string) === idToRename}
                name={node.title as string}
                submitCallback={submitCallback}
            />
        ) : (
            title
        );
    };

    const createAction: Action = {
        type: 'action',
        text: 'Create',
        handler: () => createNewCategory(),
    };

    const createAndAttachAction: Action = {
        type: 'action',
        text: 'Create & Attach',
        handler: node => {
            if (node) {
                createAndAttachNewCategory(node.id);
            }
        },
    };

    const deleteAction: Action = {
        type: 'action',
        text: 'Delete',
        handler: node => {
            if (node) {
                deleteCategory(node.id);
            }
        },
    };

    return (
        <div
            ref={divRef}
            className="tw-h-full tw-w-full tw-flex tw-flex-col tw-items-center"
            onContextMenu={event => handleElementContentMenu(event)}
        >
            <Input
                type="search"
                className="tw-bg-white/5 tw-text-cool-white tw-m-2 tw-border-white/5 tw-w-11/12"
                placeholder="Search"
                onChange={onSearchChange}
            />
            <Tree
                className="tw-w-full tw-bg-transparent tw-text-white-gray"
                showLine
                switcherIcon={<DownOutlined />}
                height={
                    divRef.current?.style.maxHeight
                        ? Number(divRef.current?.style.maxHeight)
                        : undefined
                }
                treeData={treeData}
                titleRender={titleRender}
                onExpand={onExpand}
                expandedKeys={searchValue.length > 0 ? searchExpandedKeys : expandedKeys}
                autoExpandParent={autoExpandParent}
                draggable
                blockNode
                onDrop={info => handleDrop(info)}
                selectable={false}
                selectedKeys={selectedNode ? [selectedNode.id] : []}
                onRightClick={info => handleNodeContentMenu(info.event, info.node)}
                onDoubleClick={(event, node) => handleDoubleClick(event, node)}
            />

            <ContextMenu
                menuId="categories-tree-menu"
                actions={[createAction]}
                nodeActions={[createAndAttachAction, renameAction, deleteAction]}
                selectedNode={selectedNode}
            />
        </div>
    );
});

export default CategoriesTreeView;
