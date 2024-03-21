import React from "react";

type Props = {
    children: React.ReactNode,
}

const BlurPage: React.FC<Props> = ({children}) => (
    <div className="tw-h-screen tw-overflow-scroll tw-backdrop-blur-[35px] dark:tw-bg-muted/40 tw-bg-muted/60 dark:tw-shadow-2xl dark:tw-shadow-black tw-mx-auto tw-pt-24 tw-p-4 tw-absolute tw-top-0 tw-right-0 tw-left-0 tw-bottom-0 tw-z-[11]">
        {children}
    </div>
);

export default BlurPage;