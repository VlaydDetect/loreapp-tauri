import React from 'react';
import { LucideIcon, Images } from 'lucide-react';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { TooltipProvider, TooltipItem } from '@/components/ui/tooltip';
import { useTabsContext } from '@/context/TabsProvider';

type ItemProps = {
    to: string;
    Icon: LucideIcon;
    tooltip: string;
};

const Item: React.FC<ItemProps> = ({ to, Icon, tooltip }) => {
    const { redirectActiveTab } = useTabsContext();

    return (
        <CommandItem className="tw-items-center tw-p-0 tw-m-0">
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
        </CommandItem>
    );
};

type Props = {};

const AppToolbar: React.FC<Props> = ({}) => {
    const { isLeftSidebarOpen } = useTabsContext();

    return (
        <TooltipProvider>
            <div
                className={`tw-w-[var(--toolbar-width)] tw-border-r-[1px] tw-border-r-light-gray tw-items-center ${isLeftSidebarOpen ? 'tw-bg-brown-grey' : 'tw-bg-rough-grey'}`}
            >
                <Command className="tw-rounded-lg tw-overflow-visible tw-bg-transparent tw-pt-0 tw-items-center">
                    <CommandList className="tw-overflow-visible tw-items-center">
                        <CommandGroup className="tw-overflow-visible tw-items-center">
                            <Item to="gallery" tooltip="Gallery" Icon={Images} />
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        </TooltipProvider>
    );
};

export default AppToolbar;
