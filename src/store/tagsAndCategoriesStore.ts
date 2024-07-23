import { makeAutoObservable } from 'mobx';
import type { TreeDataNode } from 'antd';
import {
    CategoriesTree,
    Category,
    CategoryNode,
    createLabelValue,
    LabelValue,
    Tag,
    TagForCreate,
} from '@/interface';
import { catFmc, tagFmc } from '@/db';
import type { TreeOptionType } from '@/hook';

class TagsAndCategoriesStore {
    categories: Category[] = [];

    tags: Tag[] = [];

    categoriesTree: CategoriesTree = { nodes: [] };

    constructor() {
        makeAutoObservable(this);
    }

    //#region ------------------------ Categories ------------------------
    get categoriesTreeAsSelectorTreeData(): TreeOptionType[] {
        return this.convertCategoriesToSelectorTreeData(this.categoriesTree.nodes);
    }

    get categoriesTreeAsTreeData(): TreeDataNode[] {
        const loop = (data: CategoryNode[]): TreeDataNode[] =>
            data.map(item => {
                if (item.children) {
                    return { title: item.name, key: item.id, children: loop(item.children) };
                }

                return {
                    title: item.name,
                    key: item.id,
                };
            });

        if (this.categoriesTree.nodes.length > 0) {
            return loop(this.categoriesTree.nodes);
        }

        return [];
    }

    private convertCategoriesToSelectorTreeData = (nodes: CategoryNode[]): TreeOptionType[] => {
        const loop = (data: CategoryNode[]): TreeOptionType[] =>
            data.map(item => {
                if (item.children) {
                    return {
                        label: item.name,
                        value: item.id,
                        children: loop(item.children),
                    };
                }

                return {
                    label: item.name,
                    value: item.id,
                };
            });

        if (nodes.length > 0) {
            return loop(nodes);
        }

        return [];
    };

    categoriesToSelectorTreeData = (categories: Category[]): TreeOptionType[] => {
        const cats: CategoryNode[] = [];

        const loop = (category: Category) => {
            const parent = this.findParent(category.id);
            if (!parent) {
                const node = this.findCategoryById(category.id);
                if (node) {
                    cats.push(node);
                }
            } else {
                loop(parent);
            }
        };

        categories.forEach(category => loop(category));

        return this.convertCategoriesToSelectorTreeData(cats);
    };

    setCategories = (categories: Category[]) => {
        this.categories = categories;
    };

    setCategoriesTree = (categoriesTree: CategoriesTree) => {
        this.categoriesTree = categoriesTree;
    };

    listCategoriesAsync = async () => {
        const categories = await catFmc.list();
        this.setCategories(categories);
    };

    listCategoriesTreeAsync = async () => {
        const tree = await catFmc.listCategoriesTree();
        this.setCategoriesTree(tree);
    };

    listCategories = () => {
        catFmc.list().then(cat => this.setCategories(cat));
    };

    listCategoriesTree = () => {
        catFmc.listCategoriesTree().then(tree => this.setCategoriesTree(tree));
    };

    createNewCategory = async () => {
        const category = await catFmc.createNewCategory();
        await this.listCategoriesTreeAsync();
        await this.listCategoriesAsync();
        return category;
    };

    /**
     * Reattach category.
     * If _`fromId`_ is undefined then category will be attached,
     * and if _`toId`_ is undefined then category will be detached
     * @param id id of the category to be reattached
     * @param fromId id of the category from which the category is detached
     * @param toId id of the category to which the category is attached
     */
    reattachCategory = (id: string, fromId: string | undefined, toId: string | undefined) => {
        catFmc.reattachSubcategory(id, fromId, toId).then(tree => this.setCategoriesTree(tree));
    };

    createCategory = (name: string) => {
        catFmc.create({ name }).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    };

    createAndAttachCategory = (name: string, fromId: string) => {
        catFmc.create({ name }).then(newCategory => {
            catFmc
                .attachSubcategory(fromId, newCategory.id)
                .then(tree => this.setCategoriesTree(tree))
                .finally(() => this.listCategories());
        });
    };

    createAndAttachNewCategory = async (fromId: string) => {
        const newCategory = await catFmc.createNewCategory();
        const tree = await catFmc.attachSubcategory(fromId, newCategory.id);
        this.setCategoriesTree(tree);
        await this.listCategoriesAsync();
        return newCategory;
    };

    renameCategory = (id: string, newName: string) => {
        catFmc.update(id, { name: newName }).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    };

    deleteCategory = (id: string) => {
        catFmc.delete(id).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    };

    findCategoryById = (id: string): CategoryNode | undefined => {
        if (this.categoriesTree.nodes.length === 0) return undefined;

        const visited = this.categoriesTree.nodes.map(() => new Set<CategoryNode>());
        let stacks = this.categoriesTree.nodes.map(root => [root]);

        while (stacks.some(stack => stack.length)) {
            for (let i = 0; i < stacks.length; i++) {
                const node = stacks[i].pop() as CategoryNode;

                if (node.id === id) return node;
                visited[i].add(node);

                // eslint-disable-next-line no-restricted-syntax
                for (const child of node.children) {
                    if (!visited[i].has(child)) {
                        stacks[i].push(child);
                    }
                }
            }
            stacks = stacks.filter(stack => stack.length);
        }

        return undefined;
    };

    findParent = (id: string): CategoryNode | undefined => {
        if (this.categoriesTree.nodes.length === 0) return undefined;
        const findInChildren = (node: CategoryNode): CategoryNode | undefined => {
            if (node.children.length === 0) return undefined;

            // eslint-disable-next-line no-restricted-syntax
            for (const child of node.children) {
                if (child.id === id) return child;

                const parent = findInChildren(child);
                if (parent) return child;
            }

            return undefined;
        };

        // eslint-disable-next-line no-restricted-syntax
        for (const node of this.categoriesTree.nodes) {
            if (node.id === id) return undefined;

            const parent = findInChildren(node);
            if (parent) return node;
        }

        return undefined;
    };

    isChild = (id: string): boolean => !!this.findParent(id);
    //#endregion ------------------------ Categories ------------------------

    //#region ------------------------ Tags ------------------------
    get tagsAsSelectorOptions(): LabelValue[] {
        return this.tagsToSelectorOption(this.tags);
    }

    tagsToSelectorOption = (tags: Tag[]): LabelValue[] =>
        tags.map(t => ({ label: t.name, value: t.id }));

    setTags = (tags: Tag[]) => {
        this.tags = tags;
    };

    listTags = () => {
        tagFmc.list().then(tags => this.setTags(tags));
    };

    private listTagsAsync = async () => {
        const tags = await tagFmc.list();
        this.setTags(tags);
    };

    createTag = async (data: TagForCreate) => {
        const tag = await tagFmc.create(data);
        await this.listTagsAsync();
        return tag;
    };
    //#endregion ------------------------ Tags ------------------------

    listTagsAndCategories = () => {
        this.listCategories();
        this.listCategoriesTree();
        this.listTags();
    };
}

const tagsAndCategoriesStore = new TagsAndCategoriesStore();

export default tagsAndCategoriesStore;
