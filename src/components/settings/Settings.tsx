import React, { FC, useState, Fragment } from 'react';
import General from './General';
import Title from '../atom/Title'
import Spinner from "../atom/Spinner";
import useSettingsStore from "@/store/settingsStore";
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
		<div className="tw-flex-auto tw-flex tw-flex-col tw-relative">
			<Title title="Settings"/>
			<span className="tw-flex tw-justify-center tw-text-mini tw-items-center tw-italic tw-font-poppins tw-text-red-600 tw-left-0 tw-ml-0 tw-pl-0">* required restart app</span>
			<div className="modules" id="modules">
				<div className="tw-overflow-auto tw-scrollbar-thin">
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

			<div className="tw-flex-[0_0_3rem] tw-w-full tw-relative before:tw-content-[''] before:tw-z-10 before:tw-absolute before:tw-w-full before:tw-top-0 before:tw-right-0 before:tw-h-[1px] before:tw-bg-[#d9d9d9] before:tw-shadow-[0_1px_10px] before:tw-shadow-[#d9d9d9]">
			{somethingChanged && <button className="tw-absolute tw-right-[10%] tw-top-5 tw-bg-white/[.9] tw-text-black" onClick={handleSave}>Save</button>}
			</div>

			{/*{loading && <Spinner className="fixed z-[300] bg-black/[.5]" tip={loadingTip}/>}*/}
		</div>
	)
}

export default Settings