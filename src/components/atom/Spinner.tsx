import React from 'react';
import { Circles } from 'react-loader-spinner';

const Spinner = ({ message }: { message?: string }) => {
    return (
        <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-h-full">
			<Circles color="#00BFFF" height="50" width="200" wrapperClass="m-5"/>

            <p className="tw-text-lg tw-text-center tw-px-2">{message}</p>
        </div>
    );
};

export default Spinner;