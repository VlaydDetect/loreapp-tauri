import React from 'react';

const Module = ({ title, id, className, children }: { title: string, id: string, className?: string, children?: any }) => {
	let classValue = '';
	if (typeof className !== 'undefined' && className.length !== 0) {
		classValue = className;
	}
	return (
		<div className={`tw-w-[75%] tw-m-[0_5%_0_20%] tw-p-[2rem_3rem] ${classValue}`} id={id} >
			<h2 className="tw-relative tw-border-b-2 tw-border-b-[#eaecef] tw-pb-2 tw-mb-[1.2rem] tw-h-[2em]">
				<span className="tw-absolute tw-p-[0_0.3em] tw-bottom-0 tw-border-b-2 tw-border-b-[#eaecef]">{title}</span>
			</h2>
			{children}
		</div>
	);
};

Module.displayName = 'SettingsModule';

export default Module;