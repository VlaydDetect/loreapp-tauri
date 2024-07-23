import React from 'react';
import { useMobXStores } from '@/context';

const MediaBucketTab: React.FC = () => {
    const {
        picturesStore: { picturesWithUrls },
    } = useMobXStores();

    // TODO: add MediaComponent to GalleryIndex and here
    return <div className="h-[900px] tw-overflow-scroll tw-p-4"></div>;
};

export default MediaBucketTab;
