import { makeAutoObservable } from 'mobx';
import { docsTemplateFmc } from '@/db';
import {
    DocumentsTemplate,
    DocumentsTemplateForCreate,
    DocumentsTemplateForUpdate,
} from '@/interface';
import { EditorElement } from '@/components/templates-editor/editor-provider';
import { JSONStringify } from '@/utils';

const defaultElement: EditorElement = {
    content: [],
    id: '__body',
    name: 'Body',
    styles: {},
    type: '__body',
};

class DocumentsTemplatesStore {
    //#region -------------------------- Fields --------------------------
    documentsTemplates: DocumentsTemplate[] = [];
    //#endregion -------------------------- Fields --------------------------

    constructor() {
        makeAutoObservable(this);
    }

    private setTemplates = (templates: DocumentsTemplate[]) => {
        this.documentsTemplates = templates;
    };

    private listTemplatesAsync = async () => {
        const temps = await docsTemplateFmc.list();
        this.setTemplates(temps);
    };

    createTemplateAsync = async (data: Omit<DocumentsTemplateForCreate, 'data'>) => {
        const newTemp = await docsTemplateFmc.create({
            name: data.name,
            data: JSONStringify(defaultElement),
            description: data.description,
        });
        await this.listTemplatesAsync();
        return newTemp;
    };

    updateTemplateAsync = async (id: string, data: DocumentsTemplateForUpdate) => {
        const response = await docsTemplateFmc.update(id, data);
        await this.listTemplatesAsync();
        return response;
    };

    deleteTemplate = (id: string) => {
        docsTemplateFmc.delete(id).finally(() => this.listTemplates());
    };

    listTemplates = () => {
        docsTemplateFmc.list().then(temps => this.setTemplates(temps));
    };

    //#region -------------------------- Getters --------------------------
    //#endregion -------------------------- Getters --------------------------

    //#region -------------------------- Privates --------------------------
    //#endregion -------------------------- Privates --------------------------

    //#region -------------------------- Publics --------------------------
    //#endregion -------------------------- Publics --------------------------
}

const documentsTemplatesStore = new DocumentsTemplatesStore();
export default documentsTemplatesStore;
