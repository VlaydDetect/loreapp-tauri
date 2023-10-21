import React, { FC, useState, Fragment } from 'react';
import General from './General';
import Title from '../atom/Title'
import Spinner from "../atom/Spinner";
import useSettingsStore from "@/components/settings/settingsStore";
import {changeAppSettings, getSettings} from "@/utils/settings";
import {findDifferences} from "@/utils/utils";

const Settings: FC = () => {
	const appSettings = useSettingsStore(state => state.settings)
	const somethingChanged = useSettingsStore(state => state.somethingChanged)
	const toggleSomethingChanged = useSettingsStore(state => state.toggleSomethingChanged)

	const [loading, setLoading] = useState(false)
	const [loadingTip, setLoadingTip] = useState('Loading')

	const showLoading = (tip: string) => {
		setLoading(true)
		setLoadingTip(tip)
	}

	const closeLoading = () => {
		setLoading(false)
		setLoadingTip('Loading')
	}

	const handleSave = () => {
		if (somethingChanged) {
			getSettings().then(oldSettings => {
				const {diff, updatedObj} = findDifferences(oldSettings, appSettings)
				if (diff.length !== 0) {
					changeAppSettings(updatedObj).then(() => toggleSomethingChanged())
				}
			})
		}
	}

	return (
		<div className="flex-auto flex flex-col relative">
			<Title title="Settings"/>
			<span className="flex justify-center text-mini items-center italic font-poppins text-red-600 left-0 ml-0 pl-0">* required restart app</span>
			<div className="modules" id="modules">
				<div className="overflow-auto scrollbar-thin">
					<div id="settings-wrapper">
						<General
							key="general-config"
							showLoading={showLoading}
							closeLoading={closeLoading}
						/>
						{/*<About*/}
						{/*	key="about-config"*/}
						{/*	id="anchor-about"*/}
						{/*/>*/}
					</div>
				</div>
			</div>

			<div className="flex-[0_0_3rem] w-full relative before:content-[''] before:z-10 before:absolute before:w-full before:top-0 before:right-0 before:h-[1px] before:bg-[#d9d9d9] before:shadow-[0_1px_10px] before:shadow-[#d9d9d9]">
			{somethingChanged && <button className="absolute right-[10%] top-5 bg-white/[.9] text-black" onClick={handleSave}>Save</button>}
			</div>

			{/*{loading && <Spinner className="fixed z-[300] bg-black/[.5]" tip={loadingTip}/>}*/}
		</div>
	)
}

export default Settings