import React, { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMobXStores } from '@/context';
import PictureDetails from '@/components/gallery/PictureDetails';
import Spinner from '@/components/atom/Spinner';

const PictureDetailsWrapper = () => {
    const { picId } = Route.useParams();
    const {
        picturesStore: { findPictureWithUrl },
    } = useMobXStores();

    const [loading, setLoading] = useState(false);

    const pic = useMemo(() => {
        setLoading(true);
        if (picId) {
            const p = findPictureWithUrl(picId);
            setLoading(!p);
            return p;
        }
    }, [picId]);

    if (loading) {
        return <Spinner />;
    }

    return <PictureDetails picture={pic} />;
};

export const Route = createFileRoute('/tabs/$tabId/gallery/$picId')({
    component: PictureDetailsWrapper,
});
