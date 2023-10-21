import {SettingOutlined} from '@ant-design/icons';

const Title = ({ title }: { title: string }) => {


	return (
		<div className="flex-[0_0_3rem] w-full relative">
			<h3 className="relative leading-[3rem] text-[1.2rem] w-[90%] m-[0_auto] text-center overflow-hidden whitespace-nowrap text-ellipsis text-white/[0.7] after:content-[''] after:z-10 after:absolute after:w-full after:bottom-0 after:left-0 after:h-[1px] after:bg-[#d9d9d9] after:shadow-[0_1px_10px] after:shadow-[#d9d9d9]">
				<SettingOutlined className="inline-flex mr-[0.4rem] text-[#92a3ad]"/>
				{title}
			</h3>
		</div>
	)
}

export default Title
