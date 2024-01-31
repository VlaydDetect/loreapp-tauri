import React from "react";
import GalleryLayout from "../components/gallery/GalleryLayout";
import {Box, Typography, Button, IconButton, useTheme} from "@mui/material";
import {tokens} from "@/theme";

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
