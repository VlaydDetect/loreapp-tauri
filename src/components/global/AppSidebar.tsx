import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import clsx from 'clsx';
import { Separator } from '@/components/ui/separator';
import { useTabsContext } from '@/context/TabsProvider';
import { cn } from '@/utils';
import DocumentsTree from '@/components/documents/DocumentsTree';
import { AnimatePresence, motion } from 'framer-motion';

type ContentProps = {
    id: string;
    activeTabId: string;
    component: React.ReactNode;
};

const SidebarTabContent: React.FC<ContentProps> = ({ id, activeTabId, component }) => {
    return (
        <div id={id} className="tw-h-full tw-w-full">
            {component}
        </div>
    );
};

type Props = {
    side: 'left' | 'right';
    open: boolean;
};

const AppSidebar: React.FC<Props> = ({ open, side }) => {
    const { leftSidebarActiveTab, rightSidebarActiveTab, redirectActiveTab } = useTabsContext();

    const handleDocumentDoubleClick = (docId: string) => {
        redirectActiveTab(`documents/${docId}`);
    };

    const leftTabsContents: React.ReactElement<ContentProps, typeof SidebarTabContent>[] = [
        <SidebarTabContent
            key="content-manager"
            id="content-manager"
            activeTabId={leftSidebarActiveTab}
            component={<DocumentsTree documentDoubleClickHandler={handleDocumentDoubleClick} />}
        />,
        // <SidebarTabContent key="bookmarks" id="bookmarks" activeTabId={leftSidebarActiveTab} component={}/>,
    ];

    const rightTabsContents: React.ReactElement<ContentProps, typeof SidebarTabContent>[] = [];

    const activeTab = useMemo(
        () => (side === 'left' ? leftSidebarActiveTab : rightSidebarActiveTab),
        [side, leftSidebarActiveTab, rightSidebarActiveTab],
    );
    const tabsContents = side === 'left' ? leftTabsContents : rightTabsContents;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
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
                    className={cn(
                        'tw-bg-brown-grey tw-border-r-[1px] tw-border-r-light-gray',
                        { 'tw-w-[var(--left-sidebar-width)]': side === 'left' },
                        { 'tw-w-[var(--right-sidebar-width)]': side === 'right' },
                    )}
                >
                    {tabsContents.map(content => {
                        if (content && content.props.id === activeTab) {
                            console.log(activeTab, content);
                            return content;
                        }
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppSidebar;
