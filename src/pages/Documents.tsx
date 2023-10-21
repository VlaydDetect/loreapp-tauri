import {emptyDocument, IDocument} from "@/interface";
import DocumentCard from "@/components/documents/DocumentCard";
import {Stack} from "@mui/material";
import {AiFillPlusCircle} from "react-icons/ai";
import { v4 as uuidv4 } from 'uuid';
import {useNavigate} from "react-router-dom"
import {createFile, filterByExtensions, getAppPath, getFilesRecursively, isExists, readFile} from "@/fs/fs";
import {useEffect, useState} from "react";
import useSettingsStore from "@/components/settings/settingsStore";
import {useFileWatcher} from "@/hook";
import Spinner from "@/components/atom/Spinner";
import {documentsFileWatcherCallback} from "@/fs/fileWatcher";

const Documents = () => {
    const [documents, setDocuments] = useState<IDocument[]>([]);

    const appSettings = useSettingsStore(state => state.settings)
    const navigate = useNavigate();

    useEffect(() => {
        getAppPath('DocumentsData').then(path => {
            isExists(path).then(exists => {
                if (exists) {
                    readFile(path).then(data => {
                        setDocuments(JSON.parse(data) as IDocument[])
                    })
                } else {
                    getFilesRecursively(appSettings.documentsPath, true).then(paths => {
                        const docs = filterByExtensions(paths, ["jdoc"])
                        console.log(`useEffect Docs: ${docs}`)
                        const newDocuments: IDocument[] = []

                        docs.forEach(doc => {
                            readFile(doc).then(data => {
                                newDocuments.push(JSON.parse(data) as IDocument)
                            })
                        })

                        console.log(`useEffect New Documents: ${newDocuments}`)

                        debugger

                        createFile({ filename: path, data: JSON.stringify(newDocuments) }).then(() => {
                            readFile(path).then(result => {
                                setDocuments(JSON.parse(result) as IDocument[])
                            })
                        })
                    })
                }
            })
        })
    }, []);

    // useFileWatcher({
    //     path: appSettings.documentsPath,
    //     callback: (event) => documentsFileWatcherCallback(event, appSettings, documents, setDocuments),
    //     options: { recursive: false, filters: ["jdoc"] }
    // })

    const createDocument = () => {
        const id = uuidv4()
        const newDocument: IDocument = {...emptyDocument, id}

        createFile({filename: `${appSettings.documentsPath}/${id}.jdoc`, data: JSON.stringify(newDocument)}).then(() => {

        })
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
