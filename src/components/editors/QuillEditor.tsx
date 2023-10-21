import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'
import {useEffect, useState} from "react";

export const QuillEditor = () => {
    const [value, setValue] = useState('');

    useEffect(() => {
        // @ts-ignore
        setValue(localStorage.getItem("editor-data"))
    }, []);

    const onChange = (newValue: string) => {
        localStorage.setItem("editor-data", value)
        setValue(newValue)
        console.log(newValue)
    }

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'image'],

            [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'supet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],

            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['clean']
        ]
    }

    return (
        <ReactQuill modules={modules} theme="snow" value={value} onChange={onChange}/>
    );
};