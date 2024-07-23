import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams } from '@tanstack/react-router';
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';
import { AiTwotoneDelete } from 'react-icons/ai';
import { Picture } from '@/interface';
import { useMobXStores } from '@/context';

const PictureView = observer(({ picture }: { picture: Picture }) => {
    const {
        picturesStore: { deletePicture },
    } = useMobXStores();

    const [picHovered, setPicHovered] = useState(false);
    const [documentsUsing, setDocumentsUsing] = useState<string[]>([]); // TODO: array of documents that use this picture
    const navigate = useNavigate();
    // @ts-ignore
    const { tabId } = useParams({ strict: false });

    const onPicClick = () => {
        navigate({
            to: `/tabs/$tabId/gallery/$picId`,
            params: { tabId, picId: picture.id },
        });
    };

    const deletePic = (id: string) => {
        deletePicture(id);
    };

    return (
        <div className="tw-m-2">
            <div
                className="tw-relative tw-cursor-zoom-in tw-w-auto hover:tw-shadow-lg tw-rounded-lg tw-overflow-hidden tw-transition-all tw-duration-500 tw-ease-in-out"
                onMouseEnter={() => setPicHovered(true)}
                onMouseLeave={() => setPicHovered(false)}
                onClick={onPicClick}
            >
                <img className="tw-rounded-lg tw-w-full" src={picture.path} alt="gallery-picture" />
                {picHovered && (
                    <div className="tw-absolute tw-top-0 tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-between tw-p-1 tw-pr-2 tw-pt-2 tw-pb-2 tw-z-50">
                        <div className="tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex tw-gap-2">
                                {documentsUsing && (
                                    <a
                                        href=""
                                        target="_blank"
                                        rel="noreferrer" // TODO: href (maybe modal window) and replace "a" tag to Link
                                        className="tw-bg-white tw-flex tw-items-center tw-gap-2 tw-text-black tw-font-bold tw-p-2 tw-pl-4 tw-pr-4 tw-rounded-full tw-opacity-70 hover:tw-opacity-100 hover:tw-shadow-md tw-outline-none"
                                    >
                                        <BsFillArrowUpRightCircleFill />
                                        Used in Documents...
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation();
                                        deletePic(picture.id);
                                    }}
                                    className="tw-bg-white tw-p-2 tw-opacity-70 tw-hover:opacity-100 tw-font-bold tw-text-black tw-text-base tw-rounded-3xl hover:tw-shadow-md tw-outline-none"
                                >
                                    <AiTwotoneDelete />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PictureView;
