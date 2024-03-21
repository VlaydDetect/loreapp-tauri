import React, { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import PictureDetails from '@/components/gallery/PictureDetails';
import { Picture } from '@/interface';
import { picFmc } from '@/db';
import Spinner from '@/components/atom/Spinner';

const PictureDetailsWrapper = () => {
    const { picId } = Route.useParams();
    const [picture, setPicture] = useState<Picture>();

    const [loading, setLoading] = useState(false);
    const [wasFound, setWasFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (picId) {
            picFmc
                .get(picId)
                .then(pic => setPicture(pic))
                .finally(() => setLoading(false)); //TODO: use try/catch or return errors from ipcInvoke for handle this errors
        }
    }, []);

    if (loading) {
        return <Spinner />;
    }

    return <PictureDetails picture={picture} />;
};

export const Route = createLazyFileRoute('/tabs/$tabId/gallery/$picId')({
    component: PictureDetailsWrapper,
});
