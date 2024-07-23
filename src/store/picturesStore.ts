import { makeAutoObservable } from 'mobx';
import { IListOptions, picFmc } from '@/db';
import { Picture, PictureForCreate, PictureForUpdate } from '@/interface';

class PicturesStore {
    //#region -------------------------- Fields --------------------------
    pictures: Picture[] = [];

    picturesWithUrls: Picture[] = [];
    //#endregion -------------------------- Fields --------------------------

    constructor() {
        makeAutoObservable(this);
    }

    //#region -------------------------- Getters --------------------------
    //#endregion -------------------------- Getters --------------------------

    //#region -------------------------- Privates --------------------------
    private listAllPicturesAsync = async (filter?: any, list_options?: IListOptions) => {
        const pics = await picFmc.list(filter, list_options);
        const pwus = await picFmc.listWithUrls(filter, list_options);
        this.setPictures(pics);
        this.setPicturesWithUrls(pwus);
    };
    //#endregion -------------------------- Privates --------------------------

    //#region -------------------------- Publics --------------------------
    setPictures = (pictures: Picture[]) => {
        this.pictures = pictures;
    };

    setPicturesWithUrls = (pictures: Picture[]) => {
        this.picturesWithUrls = pictures;
    };

    listPictures = (filter?: any, list_options?: IListOptions) => {
        picFmc.list(filter, list_options).then(pics => this.setPictures(pics));
    };

    listPicturesWithUrls = (filter?: any, list_options?: IListOptions) => {
        picFmc.listWithUrls(filter, list_options).then(pics => this.setPicturesWithUrls(pics));
    };

    listAllPictures = (filter?: any, list_options?: IListOptions) => {
        this.listPictures(filter, list_options);
        this.listPicturesWithUrls(filter, list_options);
    };

    createPicture = (data: PictureForCreate) => {
        picFmc.create(data).finally(() => this.listAllPictures());
    };

    createPictureAsync = async (data: PictureForCreate) => {
        const pic = await picFmc.create(data);
        await this.listAllPicturesAsync();
        return pic;
    };

    updatePicture = (id: string, data: PictureForUpdate) => {
        picFmc.update(id, data).finally(() => this.listAllPictures());
    };

    deletePicture = (id: string) => {
        picFmc.delete(id).finally(() => this.listAllPictures());
    };

    findPictureWithUrl = (id: string): Picture | undefined =>
        this.picturesWithUrls.find(pic => pic.id === id);
    //#endregion -------------------------- Publics --------------------------
}

const picturesStore = new PicturesStore();
export default picturesStore;
