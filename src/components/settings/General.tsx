import React, {FC} from "react"
import Module from "./Module";
import Selector from '../atom/Selector'
import {AppSettings, SortBy} from "@/interface";
import useSettingsStore from "@/store/settingsStore";

interface IProps {
	showLoading: Function,
	closeLoading: Function,
}

const General: FC<IProps> = ({showLoading, closeLoading}) => {
	const settings = useSettingsStore(state => state.settings)
	const changeSettings = useSettingsStore(state => state.changeSettings)

	const handleSelectorChange = (type: string, value: any) => {
		changeSettings(type as keyof AppSettings, value)
	}

	return (
		<Module title="General" id="anchor-general">
			<Selector type="sortBy" title="Sort By"
					  options={[{
						  label: 'Normal',
						  value: 'normal',
					  }, {
						  label: 'Create Date',
						  value: 'createDate',
					  }, {
						  label: 'Update Date',
						  value: 'updateDate',
					  }]}
					  width={130} value={settings.sortBy} onChange={handleSelectorChange}
			/>
		</Module>
	)
}

export default General
