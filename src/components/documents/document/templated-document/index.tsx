import React, { useEffect, useState } from 'react';
import { Document } from '@/interface';
import { Separator } from '@/components/ui/separator';
import { EditorElement } from '@/components/templates-editor/types.ts';
import Recursive from './recursive';

type Props = {
    document: Document;
};

const TemplatedDocument: React.FC<Props> = ({ document }) => {
    const [elements, setElements] = useState<EditorElement[]>([]);

    useEffect(() => {
        setElements(document.body ? JSON.parse(document.body) : []);
    }, [document]);

    return (
        <div className="tw-h-screen tw-w-full tw-flex tw-flex-col tw-items-center tw-justify-start">
            <div className="tw-text-lg tw-text-white">{document.title}</div>
            <Separator className="tw-w-full tw-text-white tw-bg-white" />

            <div className="tw-relative tw-w-full tw-h-full">
                {Array.isArray(elements) &&
                    elements.map(elem => <Recursive key={elem.id} element={elem} />)}
            </div>
        </div>
    );
};

export default TemplatedDocument;
