import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Masonry from 'react-masonry-css';
import { FolderUp, ImageUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PictureView from './PictureView';
import { CategoryNode } from '@/interface';
import CategoriesTreeView from '@/components/CategoriesTreeView';
import MediaUploadButton from '@/components/atom/MediaUploadButton';
import { useMobXStores } from '@/context';

const breakpointObj = {
    default: 4,
    3000: 6,
    2000: 5,
    1200: 3,
    1000: 2,
    500: 1,
};

const GalleryIndex: React.FC = observer(() => {
    const {
        picturesStore: { picturesWithUrls, listAllPictures },
    } = useMobXStores();

    useEffect(() => {
        listAllPictures();
    }, []);

    const categoriesTreeHandler = (node: CategoryNode) => {
        const filter = [
            {
                categories: {
                    $contains: `${node.name}`,
                },
            },
        ];

        listAllPictures(filter);
    };

    return (
        <div className="tw-grid tw-grid-cols-4 tw-h-screen tw-w-screen">
            <div className="tw-col-span-1 tw-h-full">
                <CategoriesTreeView doubleClickHandler={categoriesTreeHandler} />
            </div>
            <div className="tw-col-span-3">
                <div className="tw-flex tw-flex-col tw-items-center tw-mt-4 tw-space-y-4">
                    <div className="tw-flex tw-flex-row tw-space-x-4">
                        <MediaUploadButton>
                            Upload Picture
                            <ImageUp className="tw-ml-2" size={20} />
                        </MediaUploadButton>
                        <Button>
                            Upload Folder
                            <FolderUp className="tw-ml-2" size={20} />
                        </Button>
                    </div>
                    {picturesWithUrls.length !== 0 ? (
                        <Masonry
                            className="tw-flex tw-animate-slide-fwd"
                            breakpointCols={breakpointObj}
                        >
                            {picturesWithUrls.map(picture => (
                                <PictureView key={picture.id} picture={picture} />
                            ))}
                        </Masonry>
                    ) : (
                        <div className="tw-flex tw-justify-center tw-items-center tw-bg-indigo-800 tw-rounded-full tw-w-max tw-ml-auto tw-mr-auto tw-p-2">
                            <span className="p-2 text-center">Gallery is Empty Now</span>
                            <span className="p-2 text-center">
                                Please, upload your pictures to the Gallery
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default GalleryIndex;
