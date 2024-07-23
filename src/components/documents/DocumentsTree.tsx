import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import type { TreeDataNode, TreeProps } from 'antd';
import { Tree } from 'antd';
import { AntdTreeNodeAttribute, EventDataNode } from 'antd/lib/tree';

import {
    ArrowUpNarrowWide,
    ChevronsDownUp,
    ChevronsUpDown,
    File,
    FolderClosed,
    FolderOpen,
    FolderPlus,
    SquarePen,
} from 'lucide-react';

import { TooltipItem, TooltipProvider } from '@/components/ui/tooltip';
import { useMobXStores } from '@/context/mobx-context';
import { DocumentsFolderChild, Document, DocumentsFolder } from '@/interface';
import { ContextMenu, useContextMenu, Action } from '@/components/context-menu';
import { RenameInput, useRenameInputs } from '@/components/atom/RenameInput';

const { DirectoryTree } = Tree;

type Props = {
    documentDoubleClickHandler: (docId: string) => void;
};

function getIcon(props: AntdTreeNodeAttribute): React.ReactNode {
    const { isLeaf, expanded } = props;

    const icon = () => {
        if (isLeaf) {
            return <File size={18} className="tw-text-gray-400" />;
        }
        return expanded ? (
            <FolderOpen size={18} className="tw-text-gray-400" />
        ) : (
            <FolderClosed size={18} className="tw-text-gray-400" />
        );
    };

    return <span className="tw-flex tw-items-center tw-h-full">{icon()}</span>;
}

const DocumentsTree: React.FC<Props> = observer(({ documentDoubleClickHandler }) => {
    const {
        documentsAndFoldersStore: {
            tree,
            findNodeById,
            findParentFolder,
            createUnnamedFolder,
            createUntitledDocument,
            updateItemName,
            isFolder,
            switchByItemType,
            deleteItem,
            moveItemBetweenFolders,
        },
    } = useMobXStores();

    const [selectedNode, setSelectedNode] = useState<Document | DocumentsFolder | undefined>(
        undefined,
    );

    const [expanded, setExpanded] = useState<React.Key[]>([]);

    const { handleElementContentMenu, handleNodeContentMenu } = useContextMenu<
        HTMLDivElement,
        Document | DocumentsFolder,
        EventDataNode<TreeDataNode>
    >({
        menuId: 'documents-tree-menu',
        setSelectedNode,
        nodeRightClickCallback: node => findNodeById(node.key as string),
    });

    const { idToRename, setIdToRename, renameAction, submitCallback } = useRenameInputs(
        (renamingId, newName) => updateItemName(renamingId, newName),
    );

    const treeData: TreeDataNode[] = useMemo(() => {
        const loop = (data: DocumentsFolderChild[]): TreeDataNode[] =>
            data.map(item => {
                if ('Document' in item) {
                    return {
                        title: item.Document.title,
                        key: item.Document.id,
                        isLeaf: true,
                    };
                }

                if (item.DocumentsFolder.children) {
                    return {
                        title: item.DocumentsFolder.name,
                        key: item.DocumentsFolder.id,
                        children: loop(item.DocumentsFolder.children),
                    };
                }

                return {
                    title: item.DocumentsFolder.name,
                    key: item.DocumentsFolder.id,
                };
            });

        if (tree.roots.length > 0) {
            return loop(tree.roots);
        }

        return [];
    }, [tree.roots]);

    const titleRender = (node: TreeDataNode) => {
        const id = node.key;
        // `title` may be only string because titles in `treeData` create using Document.title or DocumentsFolder.name which are always strings
        // all title decorations occur in this function
        const title = node.title as string;

        return (
            <span className="tw-w-full tw-text-center">
                <RenameInput
                    name={title}
                    isRenaming={id === idToRename}
                    submitCallback={submitCallback}
                    escapeCallback={() => setIdToRename(undefined)}
                />
            </span>
        );
    };

    const handleDrop: TreeProps['onDrop'] = event => {
        const { dragNode, node: dropNode } = event;
        debugger;
        const parent = findParentFolder(dragNode.key as string);

        moveItemBetweenFolders(
            dragNode.key as string,
            parent?.id,
            event.dropToGap ? undefined : (dropNode.key as string),
        );
    };

    const handleDoubleClick: TreeProps['onDoubleClick'] = (event, node) => {
        const id = node.key as string;
        switchByItemType(id, () => documentDoubleClickHandler(id));
    };

    const deleteAction: Action = {
        type: 'action',
        text: 'Delete',
        handler: node => {
            if (node) {
                deleteItem(node.id);
            }
        },
    };

    return (
        <div className="tw-h-full tw-w-full">
            {/* TOOLBAR */}
            <div className="tw-flex tw-text-white-gray tw-flex-row tw-items-center tw-justify-center tw-space-x-0.5">
                <TooltipProvider>
                    <TooltipItem
                        trigger={
                            <div>
                                <SquarePen size={18} className="tw-text-gray-400" />
                            </div>
                        }
                        content="New Document"
                        side="bottom"
                        onClick={async () => {
                            const newDoc = await createUntitledDocument();
                            setIdToRename(newDoc.id);
                        }}
                    />

                    <TooltipItem
                        trigger={
                            <div>
                                <FolderPlus size={18} className="tw-text-gray-400" />
                            </div>
                        }
                        content="New Folder"
                        side="bottom"
                        onClick={async () => {
                            const newFolder = await createUnnamedFolder();
                            setIdToRename(newFolder.id);
                        }}
                    />

                    <TooltipItem
                        trigger={
                            <div>
                                <ArrowUpNarrowWide size={18} className="tw-text-gray-400" />
                            </div>
                        }
                        content="Sorting Order"
                        side="bottom"
                        onClick={() => {}}
                    />

                    <TooltipItem
                        trigger={
                            <div>
                                {expanded.length ? (
                                    <ChevronsDownUp size={18} className="tw-text-gray-400" />
                                ) : (
                                    <ChevronsUpDown size={18} className="tw-text-gray-400" />
                                )}
                            </div>
                        }
                        content={`${expanded ? 'Expand' : 'Collapse'} All`}
                        side="bottom"
                        onClick={() =>
                            setExpanded(prev =>
                                prev.length
                                    ? []
                                    : treeData
                                          .filter(node => isFolder(node.key as string))
                                          .map(node => node.key),
                            )
                        }
                    />
                </TooltipProvider>
            </div>

            <div
                className="tw-h-full tw-w-full tw-mt-4"
                onContextMenu={event => handleElementContentMenu(event)}
            >
                <DirectoryTree
                    className="tw-bg-transparent tw-text-white-gray"
                    treeData={treeData}
                    expandedKeys={expanded}
                    icon={getIcon}
                    blockNode
                    selectable={false}
                    titleRender={titleRender}
                    onExpand={keys => setExpanded(keys)}
                    onRightClick={({ event, node }) => handleNodeContentMenu(event, node)}
                    draggable
                    onDrop={info => handleDrop(info)}
                    onDoubleClick={handleDoubleClick}
                />
            </div>

            <ContextMenu
                menuId="documents-tree-menu"
                actions={[]}
                nodeActions={[renameAction, deleteAction]}
                selectedNode={selectedNode}
            />
        </div>
    );
});

export default DocumentsTree;
