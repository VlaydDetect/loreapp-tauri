import type {EditorState} from "lexical";
import { NIL as NIL_UUID } from "uuid";
import {LabelValue} from "@/interface/LabelValue";

export type DirectoryContentType = "File" | "Directory";

export type DirectoryContent = {
    [key in DirectoryContentType]: [string, string];
};

export enum ContextMenuType {
    None,
    General,
    DirectoryEntity,
}

export const createOption = (label: string): LabelValue => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: label.toLowerCase().replace(/\W/g, ''), // TODO: replace ' ' with '-'
});

export const findOptionByLabel = (options: LabelValue[], label: string) => {
    return options.find(opt => opt.label === label)
}

export const findOptionByValue = (options: LabelValue[], value: string) => {
    return options.find(opt => opt.value === value)
}
