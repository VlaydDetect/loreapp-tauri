import * as React from 'react';
import {IPicture} from "@/interface";
import {useEffect, useState} from "react";
import useSettingsStore from "@/store/settingsStore";
import {
    createFile,
    filterByExtensions,
    getAppPath,
    getFilesRecursively,
    isExists,
    readFile
} from "@/fs/fs";
import Masonry from "react-masonry-css";
import {convertFileSrc} from "@tauri-apps/api/tauri";

import './Input.css'

type Props = Readonly<{
    loadImage: (images: IPicture | null) => void;
}>;

const breakpointObj = {
    default: 3,
    500: 4,
    250: 3,
    100: 2,
}

// TODO: get data from Gallery component
export default function GalleryInput({loadImage}: Props) {

    const appSettings = useSettingsStore(state => state.settings)
    const [pictures, setPictures] = useState<IPicture[]>([]);

    useEffect(() => {
        getAppPath('GalleryData').then(path => {
            isExists(path).then(exists => {
                if (exists) {
                    readFile(path).then(data => {
                        setPictures(JSON.parse(data) as IPicture[])
                    })
                } else {
                    getFilesRecursively(appSettings.galleryPath, true).then(result => {
                        const imgs = filterByExtensions(result)
                        const pics: IPicture[] = []

                        imgs.forEach((image, index) => {
                            pics.push({
                                id: index,
                                title: '',
                                description: '',
                                imgPath: image,
                                tags: [],
                                categories: []
                            })
                        })

                        createFile({ filename: path, data: JSON.stringify(pics) }).then(() => {
                            readFile(path).then(result => {
                                setPictures(JSON.parse(result) as IPicture[])
                            })
                        })
                    })
                }
            })
        })
    }, [appSettings.galleryPath]);

    return (
        <div className="flex w-[512px] max-h-[512px]">
            {pictures.length !== 0 && (
                <Masonry className="overflow-y-auto flex animate-slide-fwd" breakpointCols={breakpointObj}>
                    {pictures.map(picture => (

                        <div key={picture.id} className="relative m-2 rounded-lg overflow-hidden flex items-center justify-center group">
                            <div key={picture.id} className="flex items-center justify-center relative overflow-hidden group"
                                 onClick={() => loadImage(picture)}
                            >
                                <img key={picture.id} className="rounded-lg w-full" src={convertFileSrc(picture.imgPath)} alt="gallery-picture"/>

                                <div key={picture.id} className="absolute inset-0 bg-gradient-to-l from-transparent via-[#e838cc] to-[#4a22bd] opacity-0 group-hover:opacity-80 transition-all duration-700" />
                                <div key={picture.id} className="pic-title absolute bottom-0 translate-y-full group-hover:-translate-y-3/4 transition-all duration-300">
                                    <div key={picture.id} className="flex flex-col items-center text-[13px] tracking-[0.2em]">
                                        <div key={picture.id} className="delay-100">{picture.title.length !== 0 ? picture.title : 'Untitled'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    ))}
                </Masonry>
            )}
        </div>

        // <div className="relative justify-center items-center w-[512px] h-[512px]">
        //     <div className="overflow-y-auto">
        //         { pictures.length !== 0 && (
        //             <Masonry className="flex animate-slide-fwd" breakpointCols={breakpointObj}>
        //                 {pictures.map((picture) => (
        //
        //                     <div key={picture.id} className="m-2">
        //                         <div key={picture.id} className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
        //                              onClick={() => loadImage(picture)}
        //                         >
        //                             <img key={picture.id} className="rounded-lg w-full" src={convertFileSrc(picture.imgPath)} alt="gallery-picture"/>
        //                         </div>
        //                     </div>
        //
        //                 ))}
        //             </Masonry>
        //         )}
        //     </div>
        // </div>
    );
};
