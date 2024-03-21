import React, { useEffect, useState } from 'react';
import { Document } from '@/interface';
import DocumentCard from '@/components/documents/DocumentCard';
import { Stack } from '@mui/material';
import { AiFillPlusCircle } from 'react-icons/ai';
import Spinner from '@/components/atom/Spinner';
import { docFmc } from '@/db';

type Props = {};

const DocumentsIndex: React.FC<Props> = ({}) => {
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);

    // const navigate = useNavigate();

    if (loading) return <Spinner message="Loading" />;

    useEffect(() => {
        docFmc.list().then(content => setDocuments(content));
    }, []);

    // const createDocument = () => {
    //     docFmc.createUntitled().then(data => {
    //         navigate(`${data.id}`);
    //     });
    // }

    return (
        <div>
            <Stack direction="row" flexWrap="wrap" justifyContent="start" gap={2}>
                {documents.map(doc => (
                    <DocumentCard key={doc.id} document={doc} />
                ))}
            </Stack>

            <button
                className="tw-fixed tw-flex tw-bottom-5 tw-right-5 tw-w-[50px] tw-h-[50px] tw-bg-green-500 tw-text-white tw-border-none tw-rounded-[50%] tw-cursor-pointer tw-justify-center tw-items-center"
                // onClick={() => createDocument()}
            >
                <AiFillPlusCircle className="w-[25px] h-[25px]" />
            </button>
        </div>
    );
};

export default DocumentsIndex;
