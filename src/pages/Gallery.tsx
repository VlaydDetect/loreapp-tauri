import React, {useEffect, useState} from "react";
import GalleryLayout from "../components/gallery/GalleryLayout";
import {Box, Typography, Button, IconButton, useTheme} from "@mui/material";
import {tokens} from "@/theme";
import useSettingsStore from "@/store/settingsStore";
import {useContentNavigation} from "@/hook";
import FolderNavigation from "@/components/FileSystem/FolderNavigation";
import {DirectoryContents} from "@/components/FileSystem/DirectoryContents";
import useContentsStore from "@/components/FileSystem/contentsStore";
import {picFmc} from "@/db";
import {useModelEvent} from "@/event";

const Gallery = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	return (
		<Box m="20px">
			<Box>
				<GalleryLayout />
			</Box>
		</Box>
	);
};

export default Gallery;
