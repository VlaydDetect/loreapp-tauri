import React, {useEffect, useRef, useState} from 'react';
import {TreeView} from "@mui/x-tree-view";
import {ExpandMore, ChevronRight, ArrowDropDown, ArrowRight} from "@mui/icons-material";
import {PopoverPosition,} from "@mui/material";
import {CategoryNode, findCategoryNodeInTree} from "@/interface";
import {
    EMenuAction,
    TDragEvent,
    TMouseEvent,
    TSelectEvent
} from "./types";
import {ContextMenu, showContextMenu} from "./ContextMenu";
import {ModalWindow} from "./ModalWindow";
import StyledTreeItem from "./StyledTreeItem";
import { observer } from "mobx-react-lite";
import {useMobXStores} from "@/context/mobx-context";

type TProps = {
    doubleClickHandler: (node: CategoryNode) => void
};

// TODO: reattach with drag&drop
const CategoriesTreeView: React.FC<TProps> = observer(({doubleClickHandler}) => {
    const {tagsAndCategoriesStore: {categoriesTree}} = useMobXStores();
    console.log(categoriesTree)

    const [anchorPosition, setAnchorPosition] = useState<PopoverPosition | undefined>(undefined);
    const [selectedNode, setSelectedNode] = useState<CategoryNode | undefined>(undefined);
    const [actions, setActions] = useState<EMenuAction[]>([]);
    const [selectedAction, setSelectedAction] = useState<EMenuAction>();
    const [openModal, setOpenModal] = useState(false);

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log(`selected node: ${selectedNode?.name}`);
    }, [selectedNode])

    //#region -------------------------- Handlers --------------------------
    const handleNodeSelect = (event: TSelectEvent, nodeId: string) => {
        event.preventDefault();
        const node = findCategoryNodeInTree(nodeId, categoriesTree);
        setSelectedNode(node);
    }

    const handleNodeDoubleClick = (event: TMouseEvent, node: CategoryNode) => {
        event.preventDefault();
        setSelectedNode(node);
        doubleClickHandler(node);
    };

    const handleDrag = (event: TDragEvent, node: CategoryNode) => {
        const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
        console.log(dragData);
        const dropData = node;

        if (dragData.parentId !== dropData.name) {
            // move, reattach (detach & attach) node
        }
    };
    //#endregion -------------------------- Handlers --------------------------

    //#region -------------------------- Utils Component --------------------------
    const renderTree = (node: CategoryNode) => (
        <StyledTreeItem
            key={node.id}
            nodeId={node.id}
            labelText={node.name}
            labelInfo={node.children.length.toString()} // TODO: show number of categories with this category
            onDragStart={event => event.dataTransfer.setData('text/plain', JSON.stringify(node))}
            onDrop={event => handleDrag(event, node)}
            onContextMenu={event => showContextMenu(event, node, divRef, setAnchorPosition, setSelectedNode, setActions)}
            onDoubleClick={event => handleNodeDoubleClick(event, node)}
            draggable
        >
            {
                Array.isArray(node.children)
                    ? node.children.map(node => renderTree(node))
                    : null
            }
        </StyledTreeItem>
    );
    //#endregion -------------------------- Utils Component --------------------------

    return (
        <div ref={divRef} className="h-full flex-grow max-w-[400]" onContextMenu={event => showContextMenu(event, undefined, divRef, setAnchorPosition, setSelectedNode, setActions)}>
            <TreeView
                aria-label="rich object"
                defaultCollapseIcon={<ArrowDropDown />}
                defaultExpandIcon={<ArrowRight />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                onNodeSelect={(event, nodeIds) => handleNodeSelect(event, nodeIds)}
                draggable
            >
                {categoriesTree.nodes.map(category => (
                    renderTree(category)
                ))}
            </TreeView>

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
                categories={categoriesTree}
                openModal={openModal}
                selectedAction={selectedAction}
                // setCategories={setCategories}
            />
        </div>
    );
});

export default CategoriesTreeView;
