import React, {useEffect, useState} from "react";
import {Document} from "@/interface";
import DocumentCard from "@/components/documents/DocumentCard";
import {Stack} from "@mui/material";
import {AiFillPlusCircle} from "react-icons/ai";
import {useNavigate} from "react-router-dom"
import Spinner from "@/components/atom/Spinner";
import {docFmc} from "@/db";

const Documents = () => {
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);

    const navigate = useNavigate();

    if (loading) return <Spinner message="Loading" />

    useEffect(() => {
        docFmc.list().then(content => setDocuments(content));
    }, []);

    const createDocument = () => {
        // docFmc.create()
    }

    return (
        <div>
            <Stack direction="row" flexWrap="wrap" justifyContent="start" gap={2}>
                {documents.map(doc => (
                    <DocumentCard key={doc.id} document={doc}/>
                ))}
            </Stack>

            <button className="fixed flex bottom-5 right-5 w-[50px] h-[50px] bg-green-500 text-white border-none rounded-[50%] cursor-pointer justify-center items-center"
                    onClick={() => createDocument()}
            >
                <AiFillPlusCircle className="w-[25px] h-[25px]"/>
            </button>
        </div>
    );
};

export default Documents
