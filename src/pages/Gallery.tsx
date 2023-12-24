import {useEffect, useState} from "react";
import GalleryLayout from "../components/gallery/GalleryLayout";
import {Box, Typography, Button, IconButton, useTheme} from "@mui/material";
import {tokens} from "@/theme";
import {DirectoryContent, Picture} from "@/interface";
import useSettingsStore from "@/components/settings/settingsStore";
import {useContentNavigation} from "@/hook";
import FolderNavigation from "@/components/FileSystem/FolderNavigation";
import {DirectoryContents} from "@/components/FileSystem/DirectoryContents";
import useContentsStore from "@/components/FileSystem/contentsStore";
import {picFmc} from "@/db";
import {useModelEvent} from "@/event";

const Gallery = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	const directoryContents = useContentsStore(state => state.contents)
	const [searchResults, setSearchResults] = useState<DirectoryContent[]>([]);

	const {
		pathHistory,
		historyPlace,
		setHistoryPlace,
		onBackArrowClick,
		onForwardArrowClick,
		canGoBackward,
		canGoForward,
		onDirectoryClick
	} = useContentNavigation(searchResults, setSearchResults);

	const appSettings = useSettingsStore(state => state.settings)
	const [pictures, setPictures] = useState<Picture[]>([]);

	return (
		<Box m="20px">
			<div className="p-4">
				<FolderNavigation
					onBackArrowClick={onBackArrowClick}
					canGoBackward={canGoBackward()}
					onForwardArrowClick={onForwardArrowClick}
					canGoForward={canGoForward()}
				/>

				<div className="pb-5">
					<div className="w-7/12">
						{pathHistory[historyPlace] !== "" && searchResults.length !== 0 && (
							<DirectoryContents
								content={
									searchResults.length === 0 ? directoryContents : searchResults
								}
								onDirectoryClick={onDirectoryClick}
							/>
						)}
					</div>
				</div>
			</div>
			<Box>
				<GalleryLayout/>
			</Box>
		</Box>
	);
};

export default Gallery;
