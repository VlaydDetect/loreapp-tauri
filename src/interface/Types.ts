import type {EditorState} from "lexical";
import { NIL as NIL_UUID } from "uuid";

export type DirectoryContentType = "File" | "Directory";

export type DirectoryContent = {
    [key in DirectoryContentType]: [string, string];
};

export enum ContextMenuType {
    None,
    General,
    DirectoryEntity,
}

export type TOption = {
    readonly value: string,
    readonly label: string
}

export const createOption = (label: string): TOption => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: label.toLowerCase().replace(/\W/g, ''), // TODO: replace ' ' with '-'
});

export const findOptionByLabel = (options: TOption[], label: string) => {
    return options.find(opt => opt.label === label)
}

export const findOptionByValue = (options: TOption[], value: string) => {
    return options.find(opt => opt.value === value)
}

export interface IPicture {
    id: number
    title: string
    description: string
    imgPath: string
    tags: TOption[]
    categories: TOption[]
}

export const emptyPicture: IPicture = {
    id: -1,
    title: '',
    description: '',
    imgPath: '',
    tags: [],
    categories: []
}

export interface IDocument {
    id: string,
    title: string,
    body: EditorState | undefined,
    tags: TOption[],
    categories: TOption[],
}

export const emptyDocument: IDocument = {
    id: NIL_UUID,
    title: 'Untitled',
    body: undefined,
    tags: [],
    categories: []
}
