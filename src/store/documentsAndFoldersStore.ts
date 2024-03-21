import { makeAutoObservable } from 'mobx';
import { docFmc, docsFolderFmc } from '@/db';
import {
    Document,
    DocumentForUpdate,
    DocumentsFolder,
    type DocumentsFolderChild,
    DocumentsFolderForUpdate,
    DocumentsFolderNode,
    DocumentsFolderTree,
} from '@/interface';

type ItemType = 'document' | 'documentsFolder';

class DocumentsAndFoldersStore {
    //#region -------------------------- Fields --------------------------
    tree: DocumentsFolderTree = { roots: [] };

    documents: Document[] = [];

    folders: DocumentsFolder[] = [];
    //#endregion -------------------------- Fields --------------------------

    constructor() {
        makeAutoObservable(this);
    }

    getItemType = (id: string): ItemType => {
        const type = id.split(':')[0];
        if (type !== 'document' && type !== 'documentsFolder') {
            throw new Error('item must be one of types: `document` or `documentsFolder`');
        }
        return type;
    };

    switchByItemType = (
        id: string,
        docCaseCallback?: () => void,
        docsFolderCaseCallback?: () => void,
    ) => {
        const type = this.getItemType(id);

        switch (type) {
            case 'document': {
                if (docCaseCallback) docCaseCallback();
                break;
            }
            case 'documentsFolder': {
                if (docsFolderCaseCallback) docsFolderCaseCallback();
                break;
            }
            default:
                throw new Error('id is not a document or documentsFolder id');
        }
    };

    //#region -------------------------- Privates --------------------------
    listTreeAsync = async () => {
        const tree = await docsFolderFmc.listFoldersTree();
        this.setTree(tree);
    };

    private listDocumentsAsync = async () => {
        const docs = await docFmc.list();
        this.setDocuments(docs);
    };

    private listFoldersAsync = async () => {
        const folders = await docsFolderFmc.list();
        this.setFolders(folders);
    };
    //#endregion -------------------------- Privates --------------------------

    //#region -------------------------- Publics --------------------------
    setTree = (tree: DocumentsFolderTree) => {
        this.tree = tree;
    };

    setDocuments = (documents: Document[]) => {
        this.documents = documents;
    };

    setFolders = (folders: DocumentsFolder[]) => {
        this.folders = folders;
    };

    listTree = () => {
        docsFolderFmc.listFoldersTree().then(tree => this.setTree(tree));
    };

    listDocuments = () => {
        docFmc.list().then(docs => this.setDocuments(docs));
    };

    listFolders = () => {
        docsFolderFmc.list().then(folders => this.setFolders(folders));
    };

    listDocumentsAndFolders = () => {
        this.listTree();
        this.listDocuments();
        this.listFolders();
    };

    createFolder = (name: string) => {
        docsFolderFmc.create({ name }).finally(() => {
            this.listTree();
            this.listFolders();
        });
    };

    createUnnamedFolder = async () => {
        let newFolder = await docsFolderFmc.createUnnamed();
        await this.listTreeAsync();
        await this.listFoldersAsync();

        return newFolder;
    };

    createDocument = (title: string) => {
        docFmc.create({ title }).finally(() => {
            this.listTree();
            this.listDocuments();
        });
    };

    createUntitledDocument = async () => {
        const newDoc = await docFmc.createUntitled();
        await this.listTreeAsync();
        await this.listDocumentsAsync();

        return newDoc;
    };

    updateItem = (id: string, data: DocumentForUpdate | DocumentsFolderForUpdate) => {
        this.switchByItemType(
            id,
            () => {
                if ('title' in data) {
                    docFmc.update(id, data).finally(() => {
                        this.listTree();
                        this.listDocuments();
                    });
                } else {
                    throw new Error('data is not a DocumentForUpdate object');
                }
            },
            () => {
                if ('name' in data) {
                    docsFolderFmc.update(id, data).finally(() => {
                        this.listTree();
                        this.listFolders();
                    });
                } else {
                    throw new Error('data is not a DocumentsFolderForUpdate object');
                }
            },
        );
    };

    updateItemName = (id: string, name: string) => {
        this.switchByItemType(
            id,
            () => this.updateItem(id, { title: name }),
            () => this.updateItem(id, { name }),
        );
    };

    deleteItem = (id: string) => {
        this.switchByItemType(
            id,
            () => {
                docFmc.delete(id).finally(() => {
                    this.listTree();
                    this.listDocuments();
                });
            },
            () => {
                docsFolderFmc.delete(id).finally(() => {
                    this.listTree();
                    this.listFolders();
                });
            },
        );
    };

    addItemToFolder = (itemId: string, folderId: string) => {
        docsFolderFmc.addItem(folderId, itemId).then(tree => this.setTree(tree));
    };

    removeItemFromFolder = (itemId: string, folderId: string) => {
        docsFolderFmc.removeItem(folderId, itemId).then(tree => this.setTree(tree));
    };

    moveItemBetweenFolders = (itemId: string, from: string | undefined, to: string | undefined) => {
        docsFolderFmc.moveItem(itemId, from, to).then(tree => this.setTree(tree));
    };

    isFolder = (id: string): boolean => this.getItemType(id) === 'documentsFolder';

    findParentFolder = (id: string): DocumentsFolderNode | undefined => {
        if (this.tree.roots.length === 0) return undefined;

        const findInChildren = (node: DocumentsFolderNode): DocumentsFolderNode | undefined => {
            if (node.children.length === 0) return undefined;

            // eslint-disable-next-line no-restricted-syntax
            for (const child of node.children) {
                if ('DocumentsFolder' in child) {
                    if (child.DocumentsFolder.id === id) return child.DocumentsFolder;

                    const parent = findInChildren(child.DocumentsFolder);
                    if (parent) return child.DocumentsFolder;
                }
            }

            return undefined;
        };

        // eslint-disable-next-line no-restricted-syntax
        for (const node of this.tree.roots) {
            if ('DocumentsFolder' in node) {
                if (node.DocumentsFolder.id === id) return undefined;

                const parent = findInChildren(node.DocumentsFolder);
                if (parent) return node.DocumentsFolder;
            }
        }

        return undefined;
    };

    findDocumentById = (id: string): Document | undefined =>
        this.documents.find(doc => doc.id === id);

    findFolderById = (id: string): DocumentsFolder | undefined =>
        this.folders.find(folder => folder.id === id);

    findNodeById = (id: string): Document | DocumentsFolder | undefined => {
        if (this.tree.roots.length === 0) return undefined;

        const type = id.split(':')[0];

        const findInChildren = (
            node: DocumentsFolderChild,
        ): Document | DocumentsFolder | undefined => {
            if ('Document' in node) {
                if (type === 'document' && node.Document.id === id) return node.Document;
            } else if ('DocumentsFolder' in node) {
                if (node.DocumentsFolder.id === id) return node.DocumentsFolder;
                // eslint-disable-next-line no-restricted-syntax
                for (const child of node.DocumentsFolder.children) {
                    if (type === 'document') {
                        if ('Document' in child && child.Document.id === id) return child.Document;
                    } else if (type === 'documentsFolder') {
                        if ('DocumentsFolder' in child) {
                            const dfNode = child.DocumentsFolder;
                            if (dfNode.id === id) return child.DocumentsFolder;
                        }
                    }

                    return findInChildren(child);
                }
            }

            return undefined;
        };

        // eslint-disable-next-line no-restricted-syntax
        for (const root of this.tree.roots) {
            const found = findInChildren(root);
            if (found) return found;
        }

        return undefined;
    };
    //#endregion -------------------------- Publics --------------------------
}

const documentsAndFoldersStore = new DocumentsAndFoldersStore();
export default documentsAndFoldersStore;
