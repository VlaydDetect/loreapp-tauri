import React, {FC} from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Select } from 'antd';

const labelLayout = {
	offset: 0,
	span: 7,
};

const Option = Select.Option;

interface IProps {
	title: string,
	options: {
		label: string,
		value: any
	}[],
	width: number,
	type: string,
	value: string,
	size?: 'small'| 'middle' | 'large',
	onChange: (type: string, value: any) => void
}

const Selector: FC<IProps> = ({ title, options, width = 80, size = 'middle', value, type, onChange }) => {
	return (
		<Row className="text-white/[.85] h-[3rem] leading-[3rem] mt-[0.6rem]">
			<Col key="label" {...labelLayout} className="pr-2 text-right">{title}:</Col>
			<Col key="view" span={10}>
				<Select style={{ width }} size={size} value={value} onChange={v => onChange(type, v)}>
					{options.map(item => (
						<Option key={item.label} value={item.value}>{item.label}</Option>
					))}
				</Select>
			</Col>
		</Row>
	)
}

Selector.displayName = 'SettingsSelector';

export default React.memo(Selector);
