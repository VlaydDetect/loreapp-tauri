import Masonry from "react-masonry-css";
import Picture from './Picture'
import {IPicture} from "@/interface";
import {Box, Typography, Button, IconButton, useTheme} from "@mui/material";
import {useState} from "react";
import Spinner from "@/components/atom/Spinner";

const breakpointObj = {
	default: 4,
	3000: 6,
	2000: 5,
	1200: 3,
	1000: 2,
	500: 1,
}

const GalleryLayout = ({ pictures }: { pictures: IPicture[] }) => {
	const [loading, setLoading] = useState(false);

	if (loading) return <Spinner message="Loading"/>

	return (
		<>
			{ pictures.length !== 0 ? (
				<Masonry className="flex animate-slide-fwd" breakpointCols={breakpointObj}>
					{pictures.map(picture => (<Picture key={picture.id} picture={picture} className="w-max"/>))}
				</Masonry>
			) : (
				<Box className="flex justify-center items-center bg-indigo-800 rounded-full w-max ml-auto mr-auto p-2">
					<Typography variant="h3" className="p-2 text-center">Please select a Gallery Directory path</Typography>
				</Box>
			) }
		</>
	)
};

export default GalleryLayout;
