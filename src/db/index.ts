import {
    CategoriesTree,
    Category,
    CategoryForCreate,
    CategoryForUpdate,
    Document,
    DocumentForCreate,
    DocumentForUpdate,
    DocumentsFolder,
    DocumentsFolderForCreate,
    DocumentsFolderForUpdate,
    DocumentsFolderTree,
    DocumentsTemplate,
    DocumentsTemplateForCreate,
    DocumentsTemplateForUpdate,
    Picture,
    PictureForCreate,
    PictureForUpdate,
    Tag,
    TagForCreate,
    TagForUpdate,
} from '@/interface';
import ipcInvoke from '@/ipc';

export type TOrderBy = ['Asc', string] | ['Desc', string];

export interface IListOptions {
    limit?: number;
    offset?: number;
    orderBys: TOrderBy[];
}

type FilterBase = {
    id?: string;
    ctime?: string;
};

type MakeFilter<F extends FilterBase> = {
    [key in keyof F]?: any;
}[];

/**
 * Base Frontend Model Controller class with basic CRUD except
 *
 * - M - For the Entity model type (e.g., Picture)
 * - C - For the Create data type (e.g., PictureForCreate)
 * - U - For the Update data type (e.g., PictureForUpdate)
 */
class BaseFmc<M, C, U, F extends FilterBase> {
    protected readonly _cmdSuffix: string;

    constructor(cmd_suffix: string) {
        this._cmdSuffix = cmd_suffix;
    }

    async get(id: string): Promise<M> {
        return ipcInvoke<M>(`get_${this._cmdSuffix}`, { id }, true);
    }

    async create(data: C): Promise<M> {
        return ipcInvoke<M>(`create_${this._cmdSuffix}`, { data }, true);
    }

    async update(id: string, data: U): Promise<M> {
        return ipcInvoke<M>(`update_${this._cmdSuffix}`, { id, data }, true);
    }

    async delete(id: string): Promise<M> {
        return ipcInvoke<M>(`delete_${this._cmdSuffix}`, { id }, true);
    }

    async list(filter?: MakeFilter<F>, list_options?: IListOptions): Promise<M[]> {
        let suffix = this._cmdSuffix;
        if (suffix.endsWith('y')) {
            suffix = `${suffix.substring(0, suffix.length - 1)}ie`;
        }
        return ipcInvoke<M[]>(`list_${suffix}s`, { filter, list_options });
    }
}

type PictureFilter = FilterBase & {
    name?: string;
    desc?: string;
    tags?: unknown[];
    categories?: unknown[];
};

class PictureFmc extends BaseFmc<Picture, PictureForCreate, PictureForUpdate, PictureFilter> {
    constructor() {
        super('picture');
    }

    async getDocumentUsedIn(id: string): Promise<string[]> {
        return ipcInvoke<string[]>('get_document_used_in', { id });
    }

    async getWithUrl(id: string): Promise<Picture> {
        return ipcInvoke<Picture>('get_picture_with_url', { id });
    }

    async listWithUrls(
        filter?: MakeFilter<PictureFilter>,
        list_options?: IListOptions,
    ): Promise<Picture[]> {
        return ipcInvoke<Picture[]>('list_pictures_with_urls', { filter, list_options });
    }

    async loadFolder(path: string): Promise<Picture[]> {
        return ipcInvoke<Picture[]>('collect_pictures_from_disk', { path });
    }
}

type DocumentFilter = FilterBase & {
    title?: string;
    body?: string;
    tags?: unknown[];
    categories?: unknown[];
    used_pics?: unknown[];
};

class DocumentFmc extends BaseFmc<Document, DocumentForCreate, DocumentForUpdate, DocumentFilter> {
    constructor() {
        super('document');
    }

    async createUntitled(): Promise<Document> {
        return ipcInvoke<Document>(`create_untitled_${this._cmdSuffix}`);
    }
}

type DocumentsFolderFilter = FilterBase & {
    name?: string;
};

class DocumentsFolderFmc extends BaseFmc<
    DocumentsFolder,
    DocumentsFolderForCreate,
    DocumentsFolderForUpdate,
    DocumentsFolderFilter
> {
    constructor() {
        super('documents_folder');
    }

    async createUnnamed(): Promise<DocumentsFolder> {
        return ipcInvoke<DocumentsFolder>('create_unnamed_folder');
    }

    async addItem(id: string, subId: string) {
        return ipcInvoke<DocumentsFolderTree>('add_folder_or_document', { id, subId });
    }

    async removeItem(id: string, subId: string) {
        return ipcInvoke<DocumentsFolderTree>('remove_folder_or_document', { id, subId });
    }

    async moveItem(id: string, fromId: string | undefined, toId: string | undefined) {
        return ipcInvoke<DocumentsFolderTree>('move_folder_or_document', { id, fromId, toId });
    }

    async listFoldersTree() {
        return ipcInvoke<DocumentsFolderTree>('list_folders_tree');
    }
}

type CategoryFilter = FilterBase & {
    name?: string;
};

class CategoryFmc extends BaseFmc<Category, CategoryForCreate, CategoryForUpdate, CategoryFilter> {
    constructor() {
        super('category');
    }

    async list(): Promise<Category[]> {
        return ipcInvoke<Category[]>(`list_categories`, {});
    }

    async createNewCategory() {
        return ipcInvoke<Category>('create_new_category', {});
    }

    async attachSubcategory(id: string, subId: string) {
        return ipcInvoke<CategoriesTree>('attach_subcategory', { id, subId });
    }

    async detachSubcategory(id: string, subId: string) {
        return ipcInvoke<CategoriesTree>('detach_subcategory', { id, subId });
    }

    async reattachSubcategory(id: string, fromId: string | undefined, toId: string | undefined) {
        return ipcInvoke<CategoriesTree>('reattach_subcategory', { id, fromId, toId });
    }

    async listCategoriesTree() {
        return ipcInvoke<CategoriesTree>('list_categories_tree');
    }
}

type TagFilter = FilterBase & {
    name?: string;
};

class TagFmc extends BaseFmc<Tag, TagForCreate, TagForUpdate, TagFilter> {
    constructor() {
        super('tag');
    }
}

type DocumnetsTemplateFilter = FilterBase & {
    name?: string;
};

class DocumnetsTemplateFmc extends BaseFmc<
    DocumentsTemplate,
    DocumentsTemplateForCreate,
    DocumentsTemplateForUpdate,
    DocumnetsTemplateFilter
> {
    constructor() {
        super('documents_template');
    }
}

//#region -------------------------- Exports --------------------------------
export const picFmc = new PictureFmc();
export const docFmc = new DocumentFmc();
export const docsFolderFmc = new DocumentsFolderFmc();
export const docsTemplateFmc = new DocumnetsTemplateFmc();
export const catFmc = new CategoryFmc();
export const tagFmc = new TagFmc();
//#endregion -------------------------- Exports --------------------------------

