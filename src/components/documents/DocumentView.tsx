import React from 'react';
import { Document } from '@/interface';
import TemplatedDocument from './document/templated-document';
import LexicalEditor from '@/components/editors/LexicalEditor';

const DocumentView = ({ document }: { document: Document | undefined }) => {
    if (!document)
        return (
            <div>
                <p>Whoops! The document cannot be loaded or does not exists...</p>
            </div>
        );

    return (
        // <div className="tw-h-screen tw-w-full tw-flex tw-flex-col tw-items-center tw-justify-start">
        //     <div className="tw-text-lg tw-text-white">{document.title}</div>
        //
        //     <div
        //         className="tw-p-2 tw-flex-[0_0_3rem] tw-w-full tw-relative
        //                     before:tw-content-[''] before:tw-z-10 before:tw-absolute before:tw-w-full before:tw-top-0 before:tw-right-0 before:tw-h-[1px] before:tw-bg-[#d9d9d9] before:tw-shadow-[0_1px_10px] before:tw-shadow-[#d9d9d9]"
        //     />
        //
        //     <div className="tw-relative tw-w-full tw-h-full">
        //         <LexicalEditor initialState={null} />
        //     </div>
        // </div>
        <div>
            <TemplatedDocument document={document} />
        </div>
    );
};
export default DocumentView;
