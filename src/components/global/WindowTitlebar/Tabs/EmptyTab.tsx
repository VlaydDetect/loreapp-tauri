import React from 'react';

type ActionProps = {
    text: string,
    action: () => void,
}

const Action = ({text, action}: ActionProps) => (
    <div onClick={() => action()}>
        <p className="tw-text-gray-400 tw-text-sm tw-capitalize tw-cursor-pointer hover:tw-text-white-gray">{text}</p>
    </div>
)

type Props = {}

const EmptyTab: React.FC<Props> = ({}) => {
    return (
        <div className="tw-flex tw-flex-col tw-align-middle tw-items-center tw-justify-center tw-h-screen tw-w-full">
            <h1 className="tw-text-white tw-capitalize tw-text-xl tw-font-semibold tw-mb-5">The file is not open</h1>
            <Action text="Create New File" action={() => {}}/>
            <Action text="Open File" action={() => {}}/>
            <Action text="Show Recent Files" action={() => {}}/>
            <Action text="Close" action={() => {}}/>
        </div>
    );
};

export default EmptyTab;