import {useEffect, useState} from "react";
import GalleryLayout from "../components/gallery/GalleryLayout";
import {Box, Typography, Button, IconButton, useTheme} from "@mui/material";
import {
	filterByExtensions,
	getFilesRecursively, createFile, getAppPath, isExists, readFile, IMAGE_EXTENSIONS, getCache
} from "@/fs/fs";
import {tokens} from "@/theme";
import {DirectoryContent, IPicture} from "@/interface";
import useSettingsStore from "@/components/settings/settingsStore";
import {useFileWatcher} from "@/hook/useFileWatcher";
import {picturesFileWatcherCallback} from "@/fs/fileWatcher";
import {useContentNavigation} from "@/hook";
import FolderNavigation from "@/components/FileSystem/FolderNavigation";
import {DirectoryContents} from "@/components/FileSystem/DirectoryContents";
import useContentsStore from "@/components/FileSystem/contentsStore";
import ipcInvoke from "@/ipc";

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
	const [pictures, setPictures] = useState<IPicture[]>([]);

	useEffect(() => {
		// getAppPath('GalleryData').then(path => {
		// 	isExists(path).then(exists => {
		// 		if (exists) {
		// 			readFile(path).then(data => {
		// 				setPictures(JSON.parse(data) as IPicture[])
		// 			})
		// 		} else {
		// 			getFilesRecursively(appSettings.galleryPath, true).then(result => {
		// 				const imgs = filterByExtensions(result, IMAGE_EXTENSIONS)
		// 				const pics: IPicture[] = []
		//
		// 				imgs.forEach((image, index) => {
		// 					pics.push({
		// 						id: index,
		// 						title: '',
		// 						description: '',
		// 						imgPath: image,
		// 						tags: [],
		// 						categories: []
		// 					})
		// 				})
		//
		// 				createFile({ filename: path, data: JSON.stringify(pics) }).then(() => {
		// 					readFile(path).then(result => {
		// 						setPictures(JSON.parse(result) as IPicture[])
		// 					})
		// 				})
		// 			})
		// 		}
		// 	})
		// })

		getCache('gallery').then(cache => {
			setPictures(JSON.parse(cache) as IPicture[])
		}).then(() => {
			ipcInvoke<unknown>("list_documents", {params: {}}).then(data => {
				console.log(data)
			})
		})
	}, [appSettings.galleryPath]);

	// useFileWatcher({
	// 	path: appSettings.galleryPath,
	// 	callback: (event) => picturesFileWatcherCallback(event, appSettings, pictures, setPictures),
	// 	options: { recursive: false, filters: IMAGE_EXTENSIONS }
	// })

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
				<GalleryLayout pictures={pictures}/>
			</Box>
		</Box>
	);
};

export default Gallery;
