import {useState} from "react";
import {DirectoryContent} from "@/interface";
import useContentsStore from "@/components/FileSystem/contentsStore";
import {openDirectory} from "@/fs/fs";

export function useContentNavigation(searchResults: DirectoryContent[], setSearchResults: (value: DirectoryContent[]) => void) {
    const [pathHistory, setPathHistory] = useState([""]);
    const [historyPlace, setHistoryPlace] = useState(0);
    const updateDirectoryContents = useContentsStore(state => state.updateDirectoryContents)

    const onBackArrowClick = () => {
        if (searchResults.length > 0) {
            setHistoryPlace(historyPlace);

            setSearchResults([]);
            return;
        }

        pathHistory.push(pathHistory[historyPlace - 1]);
        setHistoryPlace((prevPlace) => prevPlace - 1);
    }

    const onForwardArrowClick = () => setHistoryPlace((prevPlace) => prevPlace + 1);

    const canGoForward = () => historyPlace < pathHistory.length - 1;
    const canGoBackward = () => historyPlace > 0;

    async function getNewDirectoryContents() {
        const contents = await openDirectory(pathHistory[historyPlace]);
        updateDirectoryContents(contents)
    }

    async function onDirectoryClick(filePath: string) {
        if (searchResults.length > 0) {
            setSearchResults([]);
        }

        pathHistory.push(filePath);
        setHistoryPlace(pathHistory.length - 1);

        await getNewDirectoryContents();
    }

    return {
        pathHistory,
        setPathHistory,
        historyPlace,
        setHistoryPlace,
        onBackArrowClick,
        onForwardArrowClick,
        canGoForward,
        canGoBackward,
        onDirectoryClick
    };
}
