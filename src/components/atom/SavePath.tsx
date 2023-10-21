import React, {ChangeEvent, FC, MutableRefObject, useState} from 'react';
import { Row, Col, Input, Button, message } from 'antd';
import {documentDir} from "@tauri-apps/api/path";
import {chooseDirectoryDialog} from "@/fs/fs";
import {useDebounce} from "@/hook";

const labelLayout = {
	offset: 0,
	span: 7,
};

interface IProps {
	title: string
	initialPath: string,
	onPathChange: (newPath: string) => void,
	requiredRestart?: boolean,
	disableInput?: boolean
}

const SavePath: FC<IProps> = ({title, initialPath, onPathChange, requiredRestart = false, disableInput = true}) => {

	const [path, setPath] = useState(initialPath)

	const debouncedSetPath = useDebounce(setPath, 500)
	const debouncedPathChange = useDebounce(onPathChange, 500)

	const handleClick =  () => {
		chooseDirectoryDialog({}).then(dirPath => {
			if (typeof dirPath === "string") {
				setPath(dirPath)
				onPathChange(dirPath)
			}
		})
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!disableInput) {
			const newPath = e.target.value
			debouncedSetPath(newPath)
			debouncedPathChange(newPath)
		}
	}

	return (
		<Row className="text-[#b3b3b3]">
			<Col key="label" {...labelLayout} className="pr-2 text-right">
				{title}:
				{ requiredRestart && <span className="italic font-poppins text-red-600 left-0 ml-0 pl-0">*</span> }
			</Col>
			<Col key="view" span={10} style={{ padding: '0 .2em' }}>
				<Input className="font-normal text-black bg-white disabled:bg-white/[.7] disabled:text-black/[.6]" value={path} onChange={handleChange} disabled={disableInput}/>
			</Col>
			<Col key="button" span={5} className="pl-[1em]">
				<Button className="bg-white/[.9] text-black" onClick={handleClick}>Choose...</Button>
			</Col>
		</Row>
	)
}

export default SavePath