import tagsAndCategoriesStore from './tagsAndCategoriesStore';
import documentsAndFoldersStore from './documentsAndFoldersStore';
import documentsTemplatesStore from './documentsTemplatesStore';
import picturesStore from './picturesStore';

class RootMobxStore {
    tagsAndCategoriesStore = tagsAndCategoriesStore;

    documentsAndFoldersStore = documentsAndFoldersStore;
    documentsTemplatesStore = documentsTemplatesStore;

    picturesStore = picturesStore;
}

export default RootMobxStore;
