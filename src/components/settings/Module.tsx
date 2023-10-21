import React from 'react';

const Module = ({ title, id, className, children }: { title: string, id: string, className?: string, children?: any }) => {
	let classValue = '';
	if (typeof className !== 'undefined' && className.length !== 0) {
		classValue = className;
	}
	return (
		<div className={`w-[75%] m-[0_5%_0_20%] p-[2rem_3rem] ${classValue}`} id={id} >
			<h2 className="relative border-b-2 border-b-[#eaecef] pb-2 mb-[1.2rem] h-[2em]">
				<span className="absolute p-[0_0.3em] bottom-0 border-b-2 border-b-[#eaecef]">{title}</span>
			</h2>
			{children}
		</div>
	);
};

Module.displayName = 'SettingsModule';

export default Module;