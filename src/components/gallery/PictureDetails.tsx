import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Trash } from 'lucide-react';
import { Select, TreeSelect } from 'antd';
import { useInput, useAntdSelect, useAntdTreeSelect } from '@/hook';
import { useTabsContext, useMobXStores } from '@/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { LabelValue, Picture, PictureForUpdate } from '@/interface';

export const PictureDetails = observer(({ picture }: { picture: Picture | undefined }) => {
    // TODO: Error page
    if (!picture)
        return (
            <div>
                <p>Whoops! The image cannot be loaded or does not exists...</p>
            </div>
        );

    const {
        tagsAndCategoriesStore: {
            categoriesTreeAsSelectorTreeData,
            categoriesToSelectorTreeData,
            tagsAsSelectorOptions,
            tagsToSelectorOption,
            createTag,
            tags,
        },
        picturesStore: { updatePicture, deletePicture },
    } = useMobXStores();
    const { redirectActiveTab } = useTabsContext();

    const { value: name, onChange: onNameChange } = useInput(picture.name);
    const { value: description, onChange: onDescriptionChange } = useInput(picture.desc);

    const [categoriesTreeSelectorProps, categoriesSelectorValue] = useAntdTreeSelect({
        treeData: categoriesTreeAsSelectorTreeData,
        isMultiple: true,
        isCheckable: true,
        showSearch: true,
        defaultValue: picture.categories ? categoriesToSelectorTreeData(picture.categories) : [],
        showTreeLine: true,
    });

    const [tagsSelectorProps, tagsSelectorValue] = useAntdSelect<LabelValue[], LabelValue>({
        onCreate: async label => {
            const newTag = await createTag({ name: label });
            return { label: newTag.name, value: newTag.id };
        },
        defaultNewOptionName: `New Tag ${tags.length + 1}`,
        options: tagsAsSelectorOptions,
        defaultValue: picture.tags ? tagsToSelectorOption(picture.tags) : [],
        showSearch: true,
        mode: 'multipleWithCreation',
    });

    const [fields, setFields] = useState(false);

    const savePicture = () => {
        if (picture && name) {
            // TODO: find diff between old and new pictures, if there is no difference then don't call update
            const updatedPicture: PictureForUpdate = {
                name,
                desc: description,
                categories: categoriesSelectorValue.map(c => c.value),
                tags: tagsSelectorValue.map(t => t.value),
            };

            updatePicture(picture.id, updatedPicture);
            redirectActiveTab('gallery');
        } else {
            setFields(true);
            setTimeout(() => setFields(false), 5000);
        }
    };

    const deletePic = async () => {
        deletePicture(picture.id);
        redirectActiveTab('gallery');
    };

    return (
        <div className="tw-h-screen tw-w-screen tw-overflow-y-auto">
            <section className="tw-relative tw-mt-5 tw-flex tw-h-fit tw-w-full tw-flex-col tw-items-center !tw-overflow-visible tw-rounded-md tw-antialiased">
                <div className="tw-flex tw-flex-col">
                    <h1 className="tw-text-center tw-text-3xl tw-text-cool-white">
                        Picture Details
                    </h1>
                    {fields && (
                        <p className="tw-text-center tw-text-xl tw-text-red-500 tw-transition-all tw-duration-150 tw-ease-in">
                            Please fill in all fields.
                        </p>
                    )}
                </div>
            </section>
            <section className="tw-relative tw-flex tw-h-fit tw-w-screen tw-flex-col tw-items-center !tw-overflow-visible tw-rounded-md tw-antialiased">
                <div className="tw-relative">
                    <img src={picture.path} alt="pic-img" />
                    <Button
                        type="button"
                        variant="destructive"
                        className="tw-absolute tw-bottom-3 tw-right-3 tw-cursor-pointer tw-rounded-full tw-p-3 tw-text-xl tw-outline-none tw-transition-all tw-duration-500 hover:tw-shadow-md"
                        onClick={deletePic}
                    >
                        <Trash size={20} />
                    </Button>
                </div>
            </section>
            <section className="tw-relative tw-mb-14 tw-mt-5 tw-flex tw-h-fit tw-w-full tw-flex-col tw-items-center !tw-overflow-visible tw-rounded-md tw-antialiased">
                <div className="tw-flex tw-h-fit tw-w-full tw-flex-col tw-items-center tw-space-y-6 tw-px-3">
                    <div className="tw-grid tw-gap-1.5 tw-w-1/4">
                        <Label htmlFor="title-input" className="tw-text-white">
                            Picture Title
                        </Label>
                        <Input
                            id="title-input"
                            type="text"
                            value={name}
                            onChange={onNameChange}
                            placeholder="Add your title here"
                            className="tw-border-b-2 tw-border-gray-200 tw-bg-black/10 tw-p-2 tw-font-bold tw-outline-none"
                        />
                    </div>

                    <div className="tw-grid tw-w-1/2 tw-gap-1.5">
                        <Label htmlFor="picture-description" className="tw-text-white">
                            Describe this picture
                        </Label>
                        <Textarea
                            id="picture-description"
                            value={description}
                            onChange={onDescriptionChange}
                            placeholder="Type to describe..."
                            className="tw-border-b-2 tw-border-gray-200 tw-bg-black/10 tw-p-2 tw-text-base tw-text-white tw-outline-none"
                        />
                    </div>

                    <div className="tw-flex tw-flex-col tw-w-1/3 tw-gap-6">
                        <div className="tw-grid tw-gap-1.5">
                            <Label htmlFor="categories-selector" className="tw-text-white">
                                Choose picture categories
                            </Label>
                            <TreeSelect
                                id="categories-selector"
                                className="tw-rounded-md tw-text-base tw-text-black tw-outline-none tw-w-full"
                                placeholder="Choose picture categories"
                                {...categoriesTreeSelectorProps}
                            />
                        </div>
                        <div className="tw-grid tw-gap-1.5">
                            <Label htmlFor="tags-selector" className="tw-text-white">
                                Choose picture tags
                            </Label>
                            <Select
                                id="tags-selector"
                                className="tw-w-full tw-rounded-md tw-text-base tw-text-black tw-outline-none"
                                placeholder="Choose picture tags"
                                {...tagsSelectorProps}
                            />
                        </div>
                    </div>

                    <div className="tw-flex tw-flex-col tw-items-end tw-justify-end tw-w-full">
                        <Button
                            type="button"
                            onClick={savePicture}
                            className="tw-w-[28] tw-rounded-full tw-bg-green-500 tw-p-2 tw-font-bold tw-text-white tw-outline-none"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
});

export default PictureDetails;
