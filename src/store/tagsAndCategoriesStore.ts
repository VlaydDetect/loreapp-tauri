import { makeAutoObservable } from 'mobx';
import {
    CategoriesTree,
    Category,
    CategoryNode,
    createLabelValue,
    LabelValue,
    Tag,
} from '@/interface';
import { catFmc, tagFmc } from '@/db';

class TagsAndCategoriesStore {
    categories: Category[] = [];

    tags: Tag[] = [];

    categoriesTree: CategoriesTree = { nodes: [] };

    constructor() {
        makeAutoObservable(this);
    }

    //#region ------------------------ Categories ------------------------
    get categoriesAsOptions(): LabelValue[] {
        return this.categories.map(c => createLabelValue(c.name));
    }

    setCategories = (categories: Category[]) => {
        this.categories = categories;
    };

    setCategoriesTree = (categoriesTree: CategoriesTree) => {
        this.categoriesTree = categoriesTree;
    };

    listCategories = () => {
        catFmc.list().then(cat => this.setCategories(cat));
    };

    listCategoriesTree = () => {
        catFmc.listCategoriesTree().then(tree => this.setCategoriesTree(tree));
    };

    createNewCategory = () => {
        catFmc.createNewCategory().finally(() => {
            this.listCategoriesTree();
            this.listCategories();
        });
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
        // console.log(`${id}, ${fromId}, ${toId}`)
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

    createAndAttachNewCategory = (fromId: string) => {
        catFmc.createNewCategory().then(newCategory => {
            catFmc
                .attachSubcategory(fromId, newCategory.id)
                .then(tree => this.setCategoriesTree(tree))
                .finally(() => this.listCategories());
        });
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
    get tagsAsOptions(): LabelValue[] {
        return this.tags.map(t => createLabelValue(t.name));
    }

    setTags = (tags: Tag[]) => {
        this.tags = tags;
    };

    listTags = () => {
        tagFmc.list().then(tags => this.setTags(tags));
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
