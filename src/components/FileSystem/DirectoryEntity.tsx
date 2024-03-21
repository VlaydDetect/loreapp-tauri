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
        <div title={name} className="tw-overflow-ellipsis tw-whitespace-nowrap tw-overflow-hidden">
            <button
                id={DIRECTORY_ENTITY_ID}
                className={`tw-directory-entity tw-bg-background hover:tw-bg-bright tw-cursor-pointer tw-w-full tw-h-7 tw-flex ${currentSelectedIdx === idx ? "tw-bg-bright" : "" }`}
                onDoubleClick={(e) => {
                    onDoubleClick(e);
                    unselectDirectoryContents();
                }}
                onClick={() => selectContentIdx(idx)}
                ref={buttonRef}
            >
                <div className={`tw-mr-1 tw-ml-1 ${type == "File" ? "tw-text-gray-500" : "tw-text-[#FFD54F]"}`}>
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
