import React, {Component, FC, PureComponent, useRef} from "react"
import PropTypes from 'prop-types';
import Module from "./Module";
import Selector from '../atom/Selector'
import SavePath from "../atom/SavePath";
import {AppSettings, SortBy} from "@/interface";
import useSettingsStore from "@/components/settings/settingsStore";

// export default class General extends PureComponent<any, any> {
// 	static displayName = 'SettingsGeneral'
// 	static props = {
// 		dispatch: PropTypes.func.isRequired,
// 		fontSize: PropTypes.number.isRequired,
// 		sortBy: PropTypes.oneOf(['create-date', 'latest-date']),
// 		showLoading: PropTypes.func.isRequired,
// 		closeLoading: PropTypes.func.isRequired,
// 	}
//
// 	handleChange = (type: string, value: any) => {
// 		this.props.dispatch({
// 			type: 'CHANGE_APP_SETTINGS',
// 			target: type,
// 			value
// 		})
// 	}
//
// 	render() {
// 		const { fontSize, sortBy, showLoading, closeLoading } = this.props;
// 		return (
// 			<Module title="General" id="anchor-general">
// 				<Selector type="sortBy" title="Sort By"
// 						  options={[{
// 							  label: 'Normal',
// 							  value: 'normal',
// 						  }, {
// 							  label: 'Create Date',
// 							  value: 'create-date',
// 						  }, {
// 							  label: 'Update Date',
// 							  value: 'latest-date',
// 						  }]}
// 						  width={130} value={sortBy} onChange={this.handleChange}
// 				/>
//
// 				<SavePath pathToChange={}/>
// 			</Module>
// 		);
// 	}
// }

interface IProps {
	showLoading: Function,
	closeLoading: Function,
}

const General: FC<IProps> = ({showLoading, closeLoading}) => {
	const settings = useSettingsStore(state => state.settings)
	const changeSettings = useSettingsStore(state => state.changeSettings)

	const handleDocPathChange = (newPath: string) => {
		changeSettings('documentsPath', newPath)
	}

	const handleGalleryPathChange = (newPath: string) => {
		changeSettings('galleryPath', newPath)
	}

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

			<SavePath title="Note Save Path" initialPath={settings.documentsPath} onPathChange={handleDocPathChange}/>
			<SavePath title="Gallery Path" initialPath={settings.galleryPath} onPathChange={handleGalleryPathChange} requiredRestart/>
		</Module>
	)
}

export default General