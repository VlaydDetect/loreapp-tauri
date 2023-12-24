import Masonry from "react-masonry-css";
import PictureView from './PictureView'
import {Picture} from "@/interface";
import {Box, Typography, Button, IconButton, useTheme, Stack} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import {useEffect, useState} from "react";
import Spinner from "@/components/atom/Spinner";
import {chooseDirectoryDialog, choosePictureFile} from "@/fs/fs";
import ipcInvoke from "@/ipc";
import {picFmc} from "@/db";
import {useModelEvent} from "@/event";

const breakpointObj = {
	default: 4,
	3000: 6,
	2000: 5,
	1200: 3,
	1000: 2,
	500: 1,
}

const GalleryLayout = () => {
	const [loading, setLoading] = useState(false);
	const [pictures, setPictures] = useState<Picture[]>([]);

	if (loading) return <Spinner message="Loading"/>


	useEffect(() => {
		picFmc.list().then(content => {
			console.log(content);
			setPictures(content)
		})
	}, []);

	useModelEvent<Picture>("picture", "update", data => {
		if (data) {
			const newPics = pictures.map(p => {
				if (p.id === data.id) {
					return {
						...data,
						id: p.id
					};
				} else {
					return data;
				}
			});

			setPictures(newPics);
		}
	});
	// function onPictureCreate(data: Picture) {
	// 	const newPics = pictures.map(p => {
	// 		if (p.id === data.id) {
	// 			return {
	// 				...data,
	// 				id: p.id
	// 			};
	// 		} else {
	// 			return data;
	// 		}
	// 	});
	//
	// 	setPictures(newPics);
	// }

	useModelEvent<Picture>("picture", "create", data => {
		console.log(data);
		if (data) {
			setPictures(prev => [...prev, data])
		}
	});

	// async function onPictureUpdate(data: Picture) {
	// 	setPictures(prev => [...prev, data])
	// }

	const onUploadPicture = () => {
		choosePictureFile(false).then(pic => {
			if (pic !== null) {
				if (typeof pic === 'string') {
					ipcInvoke<Picture>("add_picture_from_disk", {path: pic}).then(p => {
						setPictures(prev => [...prev, p]);
					});
				}
			}
		})
	}

	const onUploadFolder = () => {
        chooseDirectoryDialog({}).then(dir => {
            if (dir !== null) {
                if (typeof dir === 'string') {
                    ipcInvoke<Picture[]>("collect_picture_from_disk", { dirPath: dir }).then(ps => {
						setPictures(prev => [...prev, ...ps]);
                    })
                }
            }
        })
	}

	console.log(`Layout pictures: ${pictures}`);

	return (
		<>
			{ pictures.length !== 0 ? (
				<Masonry className="flex animate-slide-fwd" breakpointCols={breakpointObj}>
					{pictures.map(picture => (<PictureView key={picture.id} picture={picture} className="w-max"/>))}
				</Masonry>
			) : (
				<Box className="flex justify-center items-center bg-indigo-800 rounded-full w-max ml-auto mr-auto p-2">
					<Typography variant="h3" className="p-2 text-center">Gallery is Empty Now</Typography>
					<Typography variant="subtitle1" className="p-2 text-center">Please, upload your pictures to the Gallery</Typography>
					<Stack direction="row" spacing={2}>
						<Button variant="contained" endIcon={<UploadFileIcon/>} onClick={onUploadPicture}>
							Upload Picture
						</Button>
						<Button variant="contained" endIcon={<DriveFolderUploadIcon/>} onClick={onUploadFolder}>
							Upload Folder
						</Button>
					</Stack>
				</Box>
			) }
		</>
	)
};

export default GalleryLayout;
