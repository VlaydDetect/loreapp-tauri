import React, {useEffect, useState} from "react";
import {Picture} from "@/interface";
import {MdDelete} from "react-icons/md";
import {useNavigate, useParams} from "react-router-dom";
import {convertFileSrc} from '@tauri-apps/api/tauri';

import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import Spinner from "@/components/atom/Spinner";
import {useMultiCreatableSelector, useInput} from "@/hook"
import {createFile, getAppPath, getCache, readFile, updateCache} from "@/fs/fs";
import useSettingsStore from "@/components/settings/settingsStore";
import {changeAppSettings, getSettings} from "@/utils/settings";
import {components} from "react-select";
import {picFmc} from "@/db";

const animatedSelector = makeAnimated();

export const PictureDetails = ({picture}: { picture: Picture | undefined }) => {

    if (!picture) return (
        <div>
            <p>Whoops! The image cannot be loaded...</p>
        </div>
    );

    const appSettings = useSettingsStore(state => state.settings)
    const updateGalleryOptions = useSettingsStore(state => state.updateSettings)
    const addCategory = useSettingsStore(state => state.addCategory)
    const addTag = useSettingsStore(state => state.addTag)

    const [title, setTitle, onTitleChange] = useInput(picture.title);
    const [description, setDescription, onDescriptionChange] = useInput(picture.desc);

    const [categories, setCategories, getCategories, setCategoriesValue, categoriesOnChange, categoriesOnCreateOption] = useMultiCreatableSelector({
        options: picture.categories ? picture.categories : [],
        onCreateCallback: option => addCategory(option)
    })
    const [tags, setTags, getTags, setTagsValue, tagsOnChange, tagsOnCreateOption] = useMultiCreatableSelector({
        options: picture.tags ? picture.tags : [],
        onCreateCallback: option => addTag(option)
    })

    const [fields, setFields] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // TODO: load tags, load categories, load picture
    useEffect(() => {
        setLoading(true)

        getSettings().then(settings => {
            updateGalleryOptions(settings)

            setCategories(settings.categories)
            setTags(settings.tags)

        }).then(() => {
            getCache('gallery').then(cache => {
                const data: IPicture[] = JSON.parse(cache) as IPicture[];
                let currentPicture = data.find(pic => pic.id.toString() === pictureId)

                currentPicture = currentPicture ? currentPicture : emptyPicture
                setPicture(currentPicture)
                setTitle(currentPicture.title)
                setDescription(currentPicture.description)

                setCategoriesValue(currentPicture.categories)
                setTagsValue(currentPicture.tags)
            })
        }).finally(() => {
            setLoading(false)
        })
    }, [pictureId]);

    const savePicture = () => {
        if (picture && title && categories) {
            setLoading(true)

            const updatedPicture: IPicture = {...picture, title, description, categories, tags};

            updateCache('gallery', JSON.stringify(updatedPicture))
                .then(() => {
                    console.log("Changing app settings")
                    changeAppSettings(appSettings).then(() => setLoading(false))
                })
                .finally(() => {
                    console.log("Navigating to gallery")
                    navigate('/gallery')
                })

            // getCache('gallery').then(cache => {
            //     const data: IPicture[] = JSON.parse(cache)
            //     const currentPicture = data.findIndex(pic => pic.id.toString() === pictureId)
            //     data[currentPicture] = {...picture, title, description, categories, tags}
            // }).then(() => {
            //     changeAppSettings(appSettings)
            // }).finally(() => navigate('/gallery'))
        } else {
            setFields(true)
            setTimeout(() => setFields(false), 5000)
        }
    }

    if (loading) {
        return <Spinner/>
    }

    if (!pictureId || !picture) {
        return <h1>Ooops!</h1> // TODO: error message
    }

    return (
        <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
            {fields && (
                <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in">Please fill in all
                    fields.</p>
            )}
            <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full">
                <div className="bg-[#F0F0F0] p-3 flex flex-[0.7] w-full">
                    <div
                        className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-[420]">
                        {loading && <Spinner/>}
                        <div className="relative h-full">
                            <img src={convertFileSrc(picture.imgPath)} alt="pic-img" className="h-full w-full"/>
                            <button type="button"
                                    className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500"
                                    onClick={() => {
                                    }} // TODO: delete picture
                            >
                                <MdDelete/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
                <input type="text" value={title} onChange={onTitleChange} placeholder="Add your title here"
                       className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
                />
                <input type="text" value={description} onChange={onDescriptionChange}
                       placeholder="Describe this picture"
                       className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                />
                <div className="flex flex-col">
                    <div>
                        <p className="mb-2 font-semibold text-lg sm:text-xl">Choose picture categories</p>
                        {/*TODO: add custom option with delete button*/}
                        <CreatableSelect
                            className="outline-none w-4/5 text-base p-2 rounded-md text-black"
                            placeholder="Choose picture categories"
                            closeMenuOnSelect={false}
                            isMulti
                            isSearchable
                            isClearable
                            components={animatedSelector}
                            options={categories}
                            value={getCategories}
                            onChange={categoriesOnChange}
                            onCreateOption={categoriesOnCreateOption}
                            backspaceRemovesValue
                        />
                    </div>
                    <div>
                        <p className="mb-2 font-semibold text-lg sm:text-xl">Choose picture tags</p>
                        <CreatableSelect
                            className="outline-none w-4/5 text-base p-2 rounded-md text-black"
                            placeholder="Choose picture tags"
                            closeMenuOnSelect={false}
                            isMulti
                            isSearchable
                            isClearable
                            components={animatedSelector}
                            options={tags}
                            value={getTags}
                            onChange={tagsOnChange}
                            onCreateOption={tagsOnCreateOption}
                            backspaceRemovesValue
                        />
                    </div>
                    <div className="flex justify-end items-end mt-5">
                        <button type="button" onClick={savePicture}
                                className="bg-green-500 text-white font-bold p-2 rounded-full w-[28] outline-none">Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailsWrapper = () => {
    const {picId: id} = useParams()
    const [picture, setPicture] = useState<Picture>();

    useEffect(() => {
        if (id) {
            picFmc.get(id).then(pic => setPicture(pic));
        }
    }, []);

    return <PictureDetails picture={picture}/>
}

export default DetailsWrapper
