import React, {useEffect, useMemo, useRef, useState} from 'react';
import {CategoryNode} from "@/interface";
import {EMenuAction} from "./types";
import {ContextMenu, showContextMenu} from "./ContextMenu";
import {ModalWindow} from "./ModalWindow";
import {observer} from "mobx-react-lite";
import {useMobXStores} from "@/context/mobx-context";

import { Tree, Input } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {PopoverPosition} from "@mui/material";

const { Search } = Input;

type TProps = {
    doubleClickHandler: (node: CategoryNode) => void
};

const CategoriesTreeView: React.FC<TProps> = observer(({doubleClickHandler}) => {
    const {tagsAndCategoriesStore: {categoriesTree, categories, findCategoryById, findParent, reattachCategory}} = useMobXStores();

    const [anchorPosition, setAnchorPosition] = useState<PopoverPosition | undefined>(undefined);
    const [selectedNode, setSelectedNode] = useState<CategoryNode | undefined>(undefined);
    const [openModal, setOpenModal] = useState(false);
    const [actions, setActions] = useState<EMenuAction[]>([]);
    const [selectedAction, setSelectedAction] = useState<EMenuAction | undefined>(undefined);

    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchExpandedKeys, setSearchExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const treeData = useMemo(() => {
        const loop = (data: CategoryNode[]): TreeDataNode[] =>
            data.map(item => {
                const titleStr = item.name;
                const index = titleStr.indexOf(searchValue);
                const before = titleStr.substring(0, index);
                const after = titleStr.slice(index + searchValue.length);
                const title = index > -1 ? (
                    <span>
                        {before}
                        <span className="text-[#f50]">{searchValue}</span>
                        {after}
                    </span>
                ) : (
                    <span>{titleStr}</span>
                );

                if (item.children) {
                    return { title, key: item.id, children: loop(item.children) };
                }

                return {
                    title,
                    key: item.id
                };
            });

        if (categoriesTree.nodes.length > 0) {
            return loop(categoriesTree.nodes)
        }
        return [];
    }, [searchValue, categoriesTree.nodes]);

    const divRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef(null);

    useEffect(() => {
        console.log(categoriesTree);
    }, [categoriesTree])

    //#region -------------------------- Handlers --------------------------
    const handleNodeSelect = (nodeId: string) => {
        const node = findCategoryById(nodeId);
        setSelectedNode(node);
    }

    const handleNodeRightClick: TreeProps['onRightClick'] = (info) => {
        if (divRef.current && divRef.current.contains(info.event.target as Node)) {
            const node = findCategoryById(info.node.key as string);
            setSelectedNode(node);
            showContextMenu(info.event, node, divRef, setAnchorPosition, setSelectedNode, setActions)
        }
    }

    const handleDoubleClick: TreeProps['onDoubleClick'] = (_event, _node) => {
        if (selectedNode) {
            doubleClickHandler(selectedNode)
        }
    }
    const handleDrop: TreeProps['onDrop'] = (event) => {
        const {dragNode, node: dropNode} = event;
        const parent = findParent(dragNode.key as string);

        const dropPos = event.node.pos.split('-');
        const dropPosition = event.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

        switch (dropPosition) {
            case -1: {

            }
            case 0: {

            }
            case 1: {

            }
        }

        debugger

        if (event.dropToGap) {
            reattachCategory(dragNode.key as string, parent?.id, undefined);
        } else {
            reattachCategory(dragNode.key as string, parent?.id, dropNode.key as string);
        }
    };

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        const newExpandedKeys = categories
            .map(item => {
                // debugger
                if (item.name.indexOf(value) > -1) {
                    const parent = findParent(item.id);
                    if (parent) return parent.id;
                }
            })
            .filter((item, i, self): item is string => !!(item && self.indexOf(item) === i));
        setSearchExpandedKeys(newExpandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    }
    //#endregion -------------------------- Handlers --------------------------

    return (
        <div ref={divRef} className="card justify-content-center h-full w-full" onContextMenu={event => showContextMenu(event, undefined, divRef, setAnchorPosition, setSelectedNode, setActions)}>
            <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onSearchChange} />
            <Tree
                ref={treeRef}
                showLine
                switcherIcon={<DownOutlined />}
                height={divRef.current?.style.maxHeight ? +divRef.current?.style.maxHeight : undefined}
                treeData={treeData}
                onExpand={onExpand}
                expandedKeys={searchValue.length > 0 ? searchExpandedKeys : expandedKeys}
                autoExpandParent={autoExpandParent}
                draggable
                blockNode
                onDrop={info => handleDrop(info)}
                selectable
                selectedKeys={selectedNode ? [selectedNode.id] : []}
                onSelect={key => handleNodeSelect(key[0] as string)}
                onRightClick={info => handleNodeRightClick(info)}
                onDoubleClick={(event, node) => handleDoubleClick(event, node)}
                // onContextMenu={event => showContextMenu(event, selectedNode, divRef, setAnchorPosition, setSelectedNode, setActions)}
            />

            <ContextMenu
                anchorPosition={anchorPosition}
                actions={actions}
                selectedNode={selectedNode}
                setAnchorPosition={setAnchorPosition}
                setOpenModal={setOpenModal}
                setSelectedAction={setSelectedAction}
            />
            <ModalWindow
                setOpenModal={setOpenModal}
                selectedNode={selectedNode}
                openModal={openModal}
                selectedAction={selectedAction}
                setSelectedAction={setSelectedAction}
            />
        </div>
    );
});

export default CategoriesTreeView;
