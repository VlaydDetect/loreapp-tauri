import React from 'react';
import {
    LucideIcon,
    Images,
    LucideMousePointerClick,
    GitBranch,
    Database,
    BookDashed,
} from 'lucide-react';
import { TooltipProvider, TooltipItem } from '@/components/ui/tooltip';
// import { Separator } from '@/components/ui/separator';
import { useTabsContext } from '@/context/TabsProvider';
import ModeToggle from '@/components/atom/mode-toggle';
import { cn } from '@/utils';

type ItemProps = {
    to: string;
    Icon: LucideIcon;
    tooltip: string;
};

const Item: React.FC<ItemProps> = ({ to, Icon, tooltip }) => {
    const { redirectActiveTab } = useTabsContext();

    return (
        <TooltipItem
            trigger={
                <div>
                    <Icon size={18} className="tw-text-gray-400" />
                </div>
            }
            content={tooltip}
            side="right"
            onClick={() => redirectActiveTab(to)}
        />
    );
};

const ListItem: React.FC<{ Icon: LucideIcon; last?: boolean }> = ({ Icon, last }) => (
    <div className="tw-relative tw-bg-[#353346]/70 tw-p-2 tw-rounded-full tw-border-[1px] tw-border-t-[2px] tw-border-t-[#353346]">
        <Icon size={18} className="tw-text-muted-foreground" />
        {!last && (
            <div className="tw-border-l-2 tw-border-muted-foreground/50 tw-h-6 tw-absolute tw-left-1/2 tw-transform tw-translate-x-[-50%] -tw-bottom-[30px]" />
        )}
    </div>
);

type Props = {};

const AppToolbar: React.FC<Props> = ({}) => {
    const { isLeftSidebarOpen } = useTabsContext();

    return (
        <TooltipProvider>
            <div
                className={cn(
                    'tw-w-[var(--toolbar-width)] tw-flex tw-flex-col tw-gap-10 tw-py-6 tw-px-2 tw-h-full tw-items-center tw-border-r-[1px] tw-border-r-light-gray tw-justify-between',
                    {
                        'tw-bg-rough-grey': !isLeftSidebarOpen,
                        'tw-bg-brown-grey': isLeftSidebarOpen,
                    },
                )}
            >
                <div className="tw-flex tw-items-center tw-justify-center tw-flex-col tw-gap-3">
                    <Item to="gallery" tooltip="Gallery" Icon={Images} />
                    <Item to="templates" tooltip="Documents Templates" Icon={BookDashed} />
                </div>

                {/* <Separator /> */}
                {/* <div className="tw-flex tw-h-56 tw-flex-col tw-items-center tw-gap-9 tw-overflow-y-scroll tw-scrollbar-hide tw-rounded-full tw-bg-[#353346]/30 tw-px-2 tw-py-4 tw-border-[1px]"> */}
                {/*    <ListItem Icon={LucideMousePointerClick} /> */}
                {/*    <ListItem Icon={GitBranch} /> */}
                {/*    <ListItem Icon={Database} /> */}
                {/*    <ListItem Icon={GitBranch} last /> */}
                {/* </div> */}

                {/* TODO: setup themes */}
                <div className="tw-flex tw-items-center tw-justify-center tw-flex-col tw-gap-8">
                    <ModeToggle />
                </div>
            </div>
        </TooltipProvider>
    );
};

export default AppToolbar;
