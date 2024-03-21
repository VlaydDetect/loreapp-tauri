import {SettingOutlined} from '@ant-design/icons';

const Title = ({ title }: { title: string }) => {


	return (
		<div className="tw-flex-[0_0_3rem] tw-w-full tw-relative">
			<h3 className="tw-relative tw-leading-[3rem] tw-text-[1.2rem] tw-w-[90%] tw-m-[0_auto] tw-text-center tw-overflow-hidden tw-whitespace-nowrap tw-text-ellipsis tw-text-white/[0.7]
						   after:tw-content-[''] after:tw-z-10 after:tw-absolute after:tw-w-full after:tw-bottom-0 after:tw-left-0 after:tw-h-[1px] after:tw-bg-[#d9d9d9] after:tw-shadow-[0_1px_10px] after:tw-shadow-[#d9d9d9]">
				<SettingOutlined className="tw-inline-flex tw-mr-[0.4rem] tw-text-[#92a3ad]"/>
				{title}
			</h3>
		</div>
	)
}

export default Title
