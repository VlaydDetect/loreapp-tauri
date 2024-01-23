import React, {useEffect, useState} from "react";
import {Category, createLabelValue, Picture, PictureForUpdate, Tag} from "@/interface";
import {MdDelete} from "react-icons/md";
import {useNavigate, useParams} from "react-router-dom";
import Selector from "react-select";
import makeAnimated from "react-select/animated";
import Spinner from "@/components/atom/Spinner";
import {useInput, useMultiSelector} from "@/hook"
import {picFmc} from "@/db";
import {useModelEvents} from "@/event";
import {useMobXStores} from "@/context/mobx-context";
import {observer} from "mobx-react-lite";

const animatedSelector = makeAnimated();

export const PictureDetails = observer(({picture}: { picture: Picture | undefined }) => {
    const {
        tagsAndCategoriesStore: {
            categories,
            setCategories,
            categoriesAsOptions,
            tags,
            setTags,
            tagsAsOptions
        }
    } = useMobXStores();

    if (!picture) return (
        <div>
            <p>Whoops! The image cannot be loaded...</p>
        </div>
    );

    const [title, setTitle, onTitleChange] = useInput(picture.title);
    const [description, setDescription, onDescriptionChange] = useInput(picture.desc);

    useModelEvents<Category>({
        topic: "category",
        exclude: ["create"],
        idAttribute: "id",
        state: categories,
        setState: setCategories
    });

    useModelEvents<Tag>({
        topic: "tag",
        exclude: ["create"],
        idAttribute: "id",
        state: tags,
        setState: setTags
    });

    const {
        options: categoriesOptions,
        values: categoriesValues,
        onChangeValues: categoriesOnChange,
    } = useMultiSelector({
        options: categoriesAsOptions,
        defaultValue: picture.categories ? picture.categories.map(c => createLabelValue(c)) : []
    });

    const {
        options: tagsOptions,
        values: tagsValues,
        onChangeValues: tagsOnChange,
    } = useMultiSelector({
        options: tagsAsOptions,
        defaultValue: picture.tags ? picture.tags.map(t => createLabelValue(t)) : [],
    });

    const [fields, setFields] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const savePicture = () => {
        if (picture && title) {
            setLoading(true)

            const updatedPicture: PictureForUpdate = {
                title,
                desc: description,
                categories: categoriesValues.map(c => c.label),
                tags: tagsValues.map(t => t.label)
            };

            picFmc.update(picture.id, updatedPicture)
                .finally(() => {
                setLoading(false);
                navigate('/gallery')
            });
        } else {
            setFields(true)
            setTimeout(() => setFields(false), 5000)
        }
    }

    const deletePicture = () => {
        picFmc.delete(picture.id).finally(() => navigate('/gallery'));
    }

    if (loading) {
        return <Spinner/>
    }

    return (
        <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
            {fields && (
                <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in">Please fill in all fields.</p>
            )}
            <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full">
                <div className="bg-[#F0F0F0] p-3 flex flex-[0.7] w-full">
                    <div
                        className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-[420]">
                        {loading && <Spinner/>}
                        <div className="relative h-full">
                            <img src={picture.img_path} alt="pic-img" className="h-full w-full"/>
                            <button type="button"
                                    className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500"
                                    onClick={() => deletePicture()}
                            >
                                <MdDelete/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
                <input type="text" defaultValue={title} onChange={onTitleChange} placeholder="Add your title here"
                       className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
                />
                <input type="text" defaultValue={description} onChange={onDescriptionChange} placeholder="Describe this picture"
                       className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                />
                <div className="flex flex-col">
                    <div>
                        <p className="mb-2 font-semibold text-lg sm:text-xl">Choose picture categories</p>
                        {/*TODO: add custom option with delete button*/}
                        <Selector
                            className="outline-none w-4/5 text-base p-2 rounded-md text-black"
                            placeholder="Choose picture categories"
                            closeMenuOnSelect={false}
                            isMulti
                            isSearchable
                            isClearable
                            components={animatedSelector}
                            options={categoriesOptions}
                            value={categoriesValues}
                            onChange={categoriesOnChange}
                            backspaceRemovesValue
                        />
                    </div>
                    <div>
                        <p className="mb-2 font-semibold text-lg sm:text-xl">Choose picture tags</p>
                        <Selector
                            className="outline-none w-4/5 text-base p-2 rounded-md text-black"
                            placeholder="Choose picture tags"
                            closeMenuOnSelect={false}
                            isMulti
                            isSearchable
                            isClearable
                            components={animatedSelector}
                            options={tagsOptions}
                            value={tagsValues}
                            onChange={tagsOnChange}
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
});

const PictureDetailsWrapper = () => {
    const {picId: id} = useParams()
    const [picture, setPicture] = useState<Picture>();

    const [loading, setLoading] = useState(false);
    const [wasFound, setWasFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (id) {
            picFmc.get(id).then(pic => setPicture(pic)).finally(() => setLoading(false)); //TODO: use try/catch or return errors from ipcInvoke for handle this errors
        }
    }, []);

    if (loading) {
        return <Spinner/>
    }

    return <PictureDetails picture={picture}/>
};

export default PictureDetailsWrapper
