import React from 'react';
import { useTabsContext } from '@/context/TabsProvider';
import { TooltipProvider, TooltipItem } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
    side: 'left' | 'right';
    open: boolean;
};

const TitlebarSidebar: React.FC<Props> = ({ side, open }) => {
    const {
        leftSidebarTabs,
        leftSidebarActiveTab,
        setLeftSidebarActiveTab,

        rightSidebarTabs,
        rightSidebarActiveTab,
        setRightSidebarActiveTab,
    } = useTabsContext();

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    data-tauri-drag-region
                    variants={{
                        open: {
                            width:
                                side === 'left'
                                    ? 'var(--left-sidebar-width)'
                                    : 'var(--right-sidebar-width)',
                            height: '100%',
                        },
                        closed: {
                            width: '0%',
                            height: '100%',
                        },
                    }}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className={`tw-flex tw-flex-row tw-w-[var(--left-sidebar-width)] tw-items-center tw-text-gray-400 tw-ml-2 tw-space-x-2`}
                >
                    <TooltipProvider>
                        {(side === 'left' ? leftSidebarTabs : rightSidebarTabs).map(tab => (
                            <TooltipItem
                                mergeClasses
                                className={
                                    side === 'left'
                                        ? tab.id === leftSidebarActiveTab
                                            ? 'tw-bg-gray-100/10 tw-border-none'
                                            : ''
                                        : tab.id === rightSidebarActiveTab
                                          ? 'tw-bg-gray-100/10 tw-border-none'
                                          : ''
                                }
                                key={tab.id}
                                trigger={tab.icon}
                                content={tab.name}
                                side="bottom"
                                onClick={() =>
                                    side === 'left'
                                        ? setLeftSidebarActiveTab(tab.id)
                                        : setRightSidebarActiveTab(tab.id)
                                }
                            />
                        ))}
                    </TooltipProvider>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TitlebarSidebar;
