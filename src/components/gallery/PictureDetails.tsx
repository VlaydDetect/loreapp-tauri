import React, { useState } from 'react';
import { Category, createLabelValue, Picture, PictureForUpdate, Tag } from '@/interface';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from '@tanstack/react-router';
import Selector from 'react-select';
import makeAnimated from 'react-select/animated';
import Spinner from '@/components/atom/Spinner';
import { useInput, useMultiSelector } from '@/hook';
import { picFmc } from '@/db';
import { useModelEvents } from '@/event';
import { useMobXStores } from '@/context/mobx-context';
import { observer } from 'mobx-react-lite';

const animatedSelector = makeAnimated();

export const PictureDetails = observer(({ picture }: { picture: Picture | undefined }) => {
    const {
        tagsAndCategoriesStore: {
            categories,
            setCategories,
            categoriesAsOptions,
            tags,
            setTags,
            tagsAsOptions,
        },
    } = useMobXStores();

    if (!picture)
        return (
            <div>
                <p>Whoops! The image cannot be loaded...</p>
            </div>
        );

    const [title, setTitle, onTitleChange] = useInput(picture.title);
    const [description, setDescription, onDescriptionChange] = useInput(picture.desc);

    useModelEvents<Category>({
        topic: 'category',
        exclude: ['create'],
        idAttribute: 'id',
        state: categories,
        setState: setCategories,
    });

    useModelEvents<Tag>({
        topic: 'tag',
        exclude: ['create'],
        idAttribute: 'id',
        state: tags,
        setState: setTags,
    });

    const {
        options: categoriesOptions,
        values: categoriesValues,
        onChangeValues: categoriesOnChange,
    } = useMultiSelector({
        options: categoriesAsOptions,
        defaultValue: picture.categories ? picture.categories.map(c => createLabelValue(c)) : [],
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
            setLoading(true);

            const updatedPicture: PictureForUpdate = {
                title,
                desc: description,
                categories: categoriesValues.map(c => c.label),
                tags: tagsValues.map(t => t.label),
            };

            picFmc.update(picture.id, updatedPicture).finally(() => {
                setLoading(false);
                // navigate('/gallery');
            });
        } else {
            setFields(true);
            setTimeout(() => setFields(false), 5000);
        }
    };

    const deletePicture = () => {
        // picFmc.delete(picture.id).finally(() => navigate('/gallery'));
        picFmc.delete(picture.id);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-5 lg:tw-h-4/5">
            {fields && (
                <p className="tw-text-red-500 tw-mb-5 tw-text-xl tw-transition-all tw-duration-150 tw-ease-in">
                    Please fill in all fields.
                </p>
            )}
            <div className="tw-flex lg:tw-flex-row tw-flex-col tw-justify-center tw-items-center tw-bg-white lg:tw-p-5 tw-p-3 lg:tw-w-4/5 tw-w-full">
                <div className="tw-bg-[#F0F0F0] tw-p-3 tw-flex tw-flex-[0.7] tw-w-full">
                    <div className="tw-flex tw-justify-center tw-items-center tw-flex-col tw-border-2 tw-border-dotted tw-border-gray-300 tw-p-3 tw-w-full tw-h-[420]">
                        {loading && <Spinner />}
                        <div className="tw-relative tw-h-full">
                            <img
                                src={picture.img_path}
                                alt="pic-img"
                                className="tw-h-full tw-w-full"
                            />
                            <button
                                type="button"
                                className="tw-absolute tw-bottom-3 tw-right-3 tw-p-3 tw-rounded-full tw-bg-white tw-text-xl tw-cursor-pointer tw-outline-none hover:tw-shadow-md tw-transition-all tw-duration-500"
                                onClick={() => deletePicture()}
                            >
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
                <input
                    type="text"
                    defaultValue={title}
                    onChange={onTitleChange}
                    placeholder="Add your title here"
                    className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
                />
                <input
                    type="text"
                    defaultValue={description}
                    onChange={onDescriptionChange}
                    placeholder="Describe this picture"
                    className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
                />
                <div className="flex flex-col">
                    <div>
                        <p className="mb-2 font-semibold text-lg sm:text-xl">
                            Choose picture categories
                        </p>
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
                        <button
                            type="button"
                            onClick={savePicture}
                            className="bg-green-500 text-white font-bold p-2 rounded-full w-[28] outline-none"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PictureDetails;
