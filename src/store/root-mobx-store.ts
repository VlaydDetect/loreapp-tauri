import tagsAndCategoriesStore from './tagsAndCategoriesStore';
import documentsAndFoldersStore from './documentsAndFoldersStore';

class RootMobxStore {
    tagsAndCategoriesStore = tagsAndCategoriesStore;

    documentsAndFoldersStore = documentsAndFoldersStore;
}

export default RootMobxStore;
