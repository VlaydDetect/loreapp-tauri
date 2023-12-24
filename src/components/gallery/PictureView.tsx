import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Picture} from "@/interface";
// import { convertFileSrc } from '@tauri-apps/api/tauri';
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { AiTwotoneDelete } from "react-icons/ai";

const PictureView = ({ picture, className }: { picture: Picture, className: string }) => {
	const [picHovered, setPicHovered] = useState(false);
	const [documentsUsing, setDocumentsUsing] = useState<string[]>([]); // TODO: array of documents that use this picture
	const navigate = useNavigate();

	const deletePic = (picture: Picture) => {

	}

	return (
		<div className="m-2">
			<div className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
				 onMouseEnter={() => setPicHovered(true)}
				 onMouseLeave={() => setPicHovered(false)}
				 onClick={() => navigate(`/pic-detail/${picture.id}`)}
			>
				<img className="rounded-lg w-full" src={picture.img_path} alt="gallery-picture"/>
				{picHovered && (
					<div className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50">
						<div className="flex justify-between items-center">
							<div className="flex gap-2">
								{documentsUsing && (
									<a href="" target="_blank" rel="noreferrer" // TODO: href (maybe modal window) and replace "a" tag to Link
									   className="bg-white flex items-center gap-2 text-black font-bold p-2 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md outline-none"
									>
										<BsFillArrowUpRightCircleFill />
										Used in Documents...
									</a>
								)}
								<button type="button"
										onClick={e =>
										{
											e.stopPropagation()
											deletePic(picture)
										}}
										className="bg-white p-2 opacity-70 hover:opacity-100 font-bold text-black text-base rounded-3xl hover:shadow-md outline-none"
								>
									<AiTwotoneDelete/>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

		</div>
	);
};

export default PictureView;
