import {MouseEventHandler, useRef} from "react";
import {DirectoryContentType} from "@/interface";
import useContentsStore from "@/components/FileSystem/contentsStore";
import {AiFillFile, AiFillFolder} from "react-icons/ai";

interface Props {
    name: string;
    path: string;
    type: DirectoryContentType;
    onDoubleClick: MouseEventHandler<HTMLButtonElement>;
    idx: number;
}

export const DIRECTORY_ENTITY_ID = "directory-entity";

export default function DirectoryEntity({ idx, name, path, type, onDoubleClick }: Props) {
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const selectContentIdx = useContentsStore(state => state.selectContentIdx)
    const currentSelectedIdx = useContentsStore(state => state.currentSelectedIdx)
    const unselectDirectoryContents = useContentsStore(state => state.unselectDirectoryContents)

    return (
        <div title={name} className="overflow-ellipsis whitespace-nowrap overflow-hidden">
            <button
                id={DIRECTORY_ENTITY_ID}
                className={`directory-entity bg-background hover:bg-bright cursor-pointer w-full h-7 flex ${currentSelectedIdx === idx ? "bg-bright" : "" }`}
                onDoubleClick={(e) => {
                    onDoubleClick(e);
                    unselectDirectoryContents();
                }}
                onClick={() => selectContentIdx(idx)}
                ref={buttonRef}
            >
                <div className={`mr-1 ml-1 ${type == "File" ? "text-gray-500" : "text-[#FFD54F]"}`}>
                    {type === "File" ? (
                        <AiFillFile/>
                    ) : (
                        <AiFillFolder/>
                    )}
                </div>
                {name}
            </button>
        </div>
    )
}
