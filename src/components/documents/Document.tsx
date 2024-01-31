import {Document} from "@/interface";
import {useParams} from "react-router-dom";
import React, {useState} from "react";
import LexicalEditor from "@/components/editors/LexicalEditor";

const DocumentView = ({ documentId }: { documentId: string | undefined }) => {
    const [document, setDocument] = useState<Document>();

    if (!document) return (
        <div>
            <p>Whoops! The document cannot be loaded...</p>
        </div>
    )

    return (
        <div>
            <div>{document.title}</div>

            <div className="p-2 flex-[0_0_3rem] w-full relative before:content-[''] before:z-10 before:absolute before:w-full before:top-0 before:right-0 before:h-[1px] before:bg-[#d9d9d9] before:shadow-[0_1px_10px] before:shadow-[#d9d9d9]"/>

            <div className="relative">
                {/*<LexicalEditor initialEditorState={}/>*/}
            </div>

        </div>
    );
};

const DocumentWrapper = () => {
    const {docId: id} = useParams()

    return <DocumentView documentId={id}/>
}

export default DocumentWrapper
