import React, { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import DocumentView from '@/components/documents/DocumentView';
import { Document } from '@/interface';
import { docFmc } from '@/db';
import Spinner from '@/components/atom/Spinner';

const DocumentWrapper: React.FC = () => {
    const { docId } = Route.useParams();
    const [document, setDocument] = useState<Document>();

    const [loading, setLoading] = useState(false);
    const [wasFound, setWasFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (docId) {
            docFmc
                .get(docId)
                .then(doc => setDocument(doc))
                .finally(() => setLoading(false)); // TODO: use try/catch or return errors from ipcInvoke for handle this errors
        }
    }, [docId]);

    if (loading) {
        return <Spinner />;
    }

    return <DocumentView document={document} />;
};

export const Route = createLazyFileRoute('/tabs/$tabId/documents/$docId')({
    component: DocumentWrapper,
});
