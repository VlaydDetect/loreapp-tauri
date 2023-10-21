import {create} from "zustand";
import {DirectoryContent} from "@/interface";
import {immer} from "zustand/middleware/immer";
import _ from "lodash";

export interface CurrentDirectoryState {
    contents: DirectoryContent[];
    currentSelectedIdx?: number;
}

interface State extends CurrentDirectoryState {
    updateDirectoryContents: (newContents: DirectoryContent[]) => void
    addContent: (content: DirectoryContent) => void,
    selectContentIdx: (index: number) => void,
    unselectDirectoryContents: () => void,
    renameContent: (oldContent: DirectoryContent, newContent: DirectoryContent) => void,
    deleteContent: (contentToDelete: DirectoryContent) => void
}

const useContentsStore = create<State>()(immer(set => ({
    contents: [],
    updateDirectoryContents: (newContents: DirectoryContent[]) => set(state => (
        {
            contents: newContents
        }
    )),
    addContent: (content: DirectoryContent) => set(state => {
        state.contents.push(content)
    }),
    selectContentIdx: (index: number) => set(state => ({
        currentSelectedIdx: index
    })),
    unselectDirectoryContents: () => set(state => ({
        currentSelectedIdx: undefined
    })),
    renameContent: (oldContent: DirectoryContent, newContent: DirectoryContent) => set(state => {
        state.contents = state.contents.filter(c => !_.isEqual(c, oldContent))
        state.contents.push(newContent)
    }),
    deleteContent: (contentToDelete: DirectoryContent) => set(state => {
        state.contents = state.contents.filter(c => !_.isEqual(c, contentToDelete));
    })
})))

export default useContentsStore
