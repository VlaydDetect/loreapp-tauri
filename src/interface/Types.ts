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

export const findCategoryNodeInTree = (nodeId: string, tree: CategoriesTree): CategoryNode | undefined => {
    if (tree.nodes.length === 0) return undefined;

    let visited = tree.nodes.map(() => new Set<CategoryNode>());
    let stacks = tree.nodes.map(root => [root]);

    while (stacks.some(stacks => stacks.length)) {
        for (let i = 0; i < stacks.length; i++) {
            let node = stacks[i].pop() as CategoryNode;

            if (node.id === nodeId) return node;
            visited[i].add(node);

            for (const child of node.children) {
                if (!visited[i].has(child)) {
                    stacks[i].push(child);
                }
            }
        }
    }

    return undefined;

    // const found = (node: CategoryNode): CategoryNode | undefined => {
    //     if (node.name === nodeId) return node;
    //
    //     if (node.children) {
    //         for (const child of node.children) {
    //             const foundNode = found(child);
    //             if (foundNode) return foundNode;
    //         }
    //     }
    //
    //     return undefined;
    // }
    //
    // for (const node of tree.nodes) {
    //     const foundNode = found(node);
    //     if (foundNode) return foundNode;
    // }
    //
    // return undefined;
}
