// import {create} from "zustand";
import {Tag, Category, CategoriesTree, createLabelValue, LabelValue} from "@/interface";
// import {immer} from "zustand/middleware/immer";
//
// type Store = {
//     categories: Category[],
//     setCategories: (categories: Category[]) => void,
//     addCategory: (category: Category) => void,
//
//     tags: Tag[],
//     setTags: (tags: Tag[]) => void,
//     addTag: (tag: Tag) => void,
// };
//
// const useTagsAndCategoriesStore = create<Store>()(immer(set => ({
//     categories: [],
//     setCategories: (categories) => set({ categories }),
//     addCategory: (category) => set(state => {
//         state.categories.push(category);
//     }),
//
//     tags: [],
//     setTags: (tags) => set({ tags }),
//     addTag: (tag) => set(state => {
//         state.tags.push(tag);
//     })
// })));

import { makeAutoObservable, runInAction } from "mobx";
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
