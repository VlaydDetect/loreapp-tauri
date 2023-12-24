import {Picture, PictureForCreate, PictureForUpdate, Document, DocumentForCreate, DocumentForUpdate} from "@/interface";
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
    private readonly _cmdSuffix: string

    get cmdSuffix(): string {
        return this._cmdSuffix;
    }

    constructor(cmd_suffix: string) {
        this._cmdSuffix = cmd_suffix;
    }

    async get(id: string): Promise<M> {
        return ipcInvoke<M>(`get_${this._cmdSuffix}`, { id });
    }

    async create(data: C): Promise<M> {
        return ipcInvoke<M>(`create_${this._cmdSuffix}`, { data });
    }

    async update(id: string, data: U): Promise<M> {
        return ipcInvoke<M>(`update_${this._cmdSuffix}`, { id, data })
    }

    async delete(id: string): Promise<M> {
        return ipcInvoke<M>(`delete_${this._cmdSuffix}`, { id })
    }

    async list(filter?: any, list_options?: IListOptions): Promise<M[]> {
        return ipcInvoke<M[]>(`list_${this._cmdSuffix}s`, { filter, list_options })
    }
}

class PictureFmc extends BaseFmc<Picture, PictureForCreate, PictureForUpdate> {
    constructor() {
        super("picture");
    }

    async get_document_used_in(id: string): Promise<string[]> {
        return ipcInvoke<string[]>('get_document_used_in', { id })
    }
}

export const picFmc = new PictureFmc();

class DocumentFmc extends BaseFmc<Document, DocumentForCreate, DocumentForUpdate> {
    constructor() {
        super("document");
    }
}

export const docFmc = new DocumentFmc();
