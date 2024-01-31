import {Tag, Category, CategoriesTree, createLabelValue, LabelValue, CategoryNode, isCategoryChild} from "@/interface";
import { makeAutoObservable } from "mobx";
import {catFmc, tagFmc} from "@/db";

class TagsAndCategoriesStore {
    categories: Category[] = [];
    categoriesTree: CategoriesTree = { nodes: [] };
    tags: Tag[] = [];

    constructor() {
        makeAutoObservable(this);
    };

    //#region ------------------------ Categories ------------------------
    get categoriesAsOptions(): LabelValue[] {
        return this.categories.map(c => createLabelValue(c.name))
    }

    setCategories = (categories: Category[]) => {
        this.categories = categories;
    }

    setCategoriesTree = (categoriesTree: CategoriesTree) => {
        this.categoriesTree = categoriesTree;
    }

    listCategories = () => {
        catFmc.list().then(cat => this.setCategories(cat))
    };

    listCategoriesTree = () => {
        catFmc.listWithParent().then(tree => this.setCategoriesTree(tree))
    }

    /**
     * Reattach category.
     * If _`fromId`_ is undefined then category will be attached,
     * and if _`toId`_ is undefined then category will be detached
     * @param id id of the category to be reattached
     * @param fromId id of the category from which the category is detached
     * @param toId id of the category to which the category is attached
     */
    reattachCategory = (id: string, fromId: string | undefined, toId: string | undefined) => {
        console.log(`${id}, ${fromId}, ${toId}`)
        catFmc.reattachSubcategory(id, fromId, toId).then(tree => this.setCategoriesTree(tree))
    }

    createCategory = (name: string) => {
        catFmc.create({ name }).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    }
    createAndAttachCategory = (name: string, fromId: string) => {
        catFmc.create({ name }).then(newCategory => {
            catFmc.attachSubcategory(fromId, newCategory.id)
                .then(tree => this.setCategoriesTree(tree))
                .finally(() => this.listCategories());
        })
    }

    renameCategory = (id: string, newName: string) => {
        catFmc.update(id, { name: newName }).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    }

    deleteCategory = (id: string) => {
        catFmc.delete(id).finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
    }

    findCategoryById = (id: string): CategoryNode | undefined => {
        if (this.categoriesTree.nodes.length === 0) return undefined;

        let visited = this.categoriesTree.nodes.map(() => new Set<CategoryNode>());
        let stacks = this.categoriesTree.nodes.map(root => [root]);

        while (stacks.some(stack => stack.length)) {
            for (let i = 0; i < stacks.length; i++) {
                let node = stacks[i].pop() as CategoryNode;

                if (node.id === id) return node;
                visited[i].add(node);

                for (const child of node.children) {
                    if (!visited[i].has(child)) {
                        stacks[i].push(child);
                    }
                }
            }
            stacks = stacks.filter(stack => stack.length)
        }

        return undefined;
    }

    findParent = (id: string): CategoryNode | undefined => {
        if (this.categoriesTree.nodes.length === 0) return undefined;
        const findInChildren = (node: CategoryNode): CategoryNode | undefined => {
            if (node.children.length === 0) return undefined;

            for (const child of node.children) {
                if (child.id === id) return child;

                let parent = findInChildren(child);
                if (parent) return child;
            }

            return undefined;
        }

        for (const node of this.categoriesTree.nodes) {
            if (node.id === id) return undefined;

            const parent = findInChildren(node);
            if (parent) return node;
        }

        return undefined;
    }

    isChild = (id: string): boolean => {
        return !!this.findParent(id);
    }
    //#endregion ------------------------ Categories ------------------------

    //#region ------------------------ Tags ------------------------
    get tagsAsOptions(): LabelValue[] {
        return this.tags.map(t => createLabelValue(t.name))
    }

    setTags = (tags: Tag[]) => {
        this.tags = tags;
    }

    listTags = () => {
        tagFmc.list().then(tags => this.setTags(tags))
    };

    listTagsAndCategories = () => {
        this.listCategories();
        this.listCategoriesTree();
        this.listTags();
    }
    //#endregion ------------------------ Tags ------------------------
}

const tagsAndCategoriesStore = new TagsAndCategoriesStore();

export default tagsAndCategoriesStore;
