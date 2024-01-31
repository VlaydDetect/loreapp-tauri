import {LabelValue} from "@/interface/LabelValue";
import {CategoryNode} from "@/interface/CategoryNode";
import {CategoriesTree} from "@/interface/CategoriesTree";

export type DirectoryContentType = "File" | "Directory";

export type DirectoryContent = {
    [key in DirectoryContentType]: [string, string];
};

export enum ContextMenuType {
    None,
    General,
    DirectoryEntity,
}

export const createLabelValue = (label: string): LabelValue => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: label.toLowerCase().replace(/\W/g, ''), // TODO: replace ' ' with '-'
});

export const findLabelValueByLabel = (options: LabelValue[], label: string) => {
    return options.find(opt => opt.label === label)
}

export const findLabelValueByValue = (options: LabelValue[], value: string) => {
    return options.find(opt => opt.value === value)
}

export const findCategoryParent = (id: string, tree: CategoriesTree): CategoryNode | undefined => {
    if (tree.nodes.length === 0) return undefined;
    const findInChildren = (node: CategoryNode): CategoryNode | undefined => {
        if (node.children.length === 0) return undefined;

        for (const child of node.children) {
            if (child.id === id) return child;

            let parent = findInChildren(child);
            if (parent) return child;
        }

        return undefined;
    }

    for (const node of tree.nodes) {
        if (node.id === id) return undefined;

        const parent = findInChildren(node);
        if (parent) return node;
    }

    return undefined;
}

export const isCategoryChild = (id: string, tree: CategoriesTree): boolean => {
    return !!findCategoryParent(id, tree);
}
