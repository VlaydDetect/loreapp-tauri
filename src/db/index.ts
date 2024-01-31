import {
    Picture, PictureForCreate, PictureForUpdate,
    Document, DocumentForCreate, DocumentForUpdate,
    Category, CategoryForCreate, CategoryForUpdate, CategoriesTree,
    Tag, TagForCreate, TagForUpdate,
} from "@/interface";
import ipcInvoke from "@/ipc";

type TOrderBy = ['Asc', string] | ['Desc', string];

interface IListOptions {
    limit?: number,
    offset?: number,
    orderBys: TOrderBy[]
}

/**
 * Base Frontend Model Controller class with basic CRUD except
 *
 * - M - For the Entity model type (e.g., Picture)
 * - C - For the Create data type (e.g., PictureForCreate)
 * - U - For the Update data type (e.g., PictureForUpdate)
 */
class BaseFmc<M, C, U> {
    protected readonly _cmdSuffix: string

    get cmdSuffix(): string {
        return this._cmdSuffix;
    }

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
        return ipcInvoke<M>(`update_${this._cmdSuffix}`, { id, data }, true)
    }

    async delete(id: string): Promise<M> {
        return ipcInvoke<M>(`delete_${this._cmdSuffix}`, { id }, true)
    }

    async list(filter?: any, list_options?: IListOptions): Promise<M[]> {
        let suffix = this._cmdSuffix;
        if (suffix.endsWith('y')) {
            suffix = suffix.substring(0, suffix.length - 1) + 'ie';
        }
        return ipcInvoke<M[]>(`list_${suffix}s`, { filter, list_options })
    }
}

class PictureFmc extends BaseFmc<Picture, PictureForCreate, PictureForUpdate> {
    constructor() {
        super("picture");
    }

    async getDocumentUsedIn(id: string): Promise<string[]> {
        return ipcInvoke<string[]>('get_document_used_in', { id })
    }
}

class DocumentFmc extends BaseFmc<Document, DocumentForCreate, DocumentForUpdate> {
    constructor() {
        super("document");
    }
}

class CategoryFmc extends BaseFmc<Category, CategoryForCreate, CategoryForUpdate> {
    constructor() {
        super("category");
    }

    async list(): Promise<Category[]> {
        return ipcInvoke<Category[]>(`list_categories`, {})
    }

    async attachSubcategory(id: string, subId: string) {
        return ipcInvoke<CategoriesTree>("attach_subcategory", { id, subId });
    }
    async detachSubcategory(id: string, subId: string) {
        return ipcInvoke<CategoriesTree>("detach_subcategory", { id, subId });
    }

    async reattachSubcategory(id: string, fromId: string | undefined, toId: string | undefined) {
        return ipcInvoke<CategoriesTree>("reattach_subcategory", { id, fromId, toId });
    }

    async listWithParent() {
        return ipcInvoke<CategoriesTree>("list_with_parent", {}, true);
    }
}

class TagFmc extends BaseFmc<Tag, TagForCreate, TagForUpdate> {
    constructor() {
        super("tag");
    }
}

//#region -------------------------- Exports --------------------------------
export const picFmc = new PictureFmc();
export const docFmc = new DocumentFmc();
export const catFmc = new CategoryFmc();
export const tagFmc = new TagFmc();
//#endregion -------------------------- Exports --------------------------------
