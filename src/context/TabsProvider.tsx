import React, { useEffect, useState } from 'react';
import {
    defaultTab,
    getWindowState,
    SidebarTab,
    Tab,
    Tabs,
    updateLastSelectedTab,
    updateTabs,
} from '@/interface';
import { leftSidebarTabs, rightSidebarTabs } from '@/constants/window-titlebar';
import { useRouter } from '@tanstack/react-router';

interface TabsProviderProps {
    children: React.ReactNode;
}

type TabsContextType = {
    tabs: Tabs;
    newTab: () => void;
    removeTab: (id: string) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    redirectActiveTab: (to: string) => void;

    isLeftSidebarOpen: boolean;
    setLeftSidebarOpen: (open: boolean) => void;
    leftSidebarTabs: SidebarTab[];
    leftSidebarActiveTab: string;
    setLeftSidebarActiveTab: (id: string) => void;

    isRightSidebarOpen: boolean;
    setRightSidebarOpen: (open: boolean) => void;
    rightSidebarTabs: SidebarTab[];
    rightSidebarActiveTab: string;
    setRightSidebarActiveTab: (id: string) => void;
};

export const TabsContext = React.createContext<TabsContextType>({
    tabs: [defaultTab],
    newTab: () => {},
    removeTab: (_id: string) => {},
    activeTab: defaultTab,
    setActiveTab: (_tab: Tab) => {},
    redirectActiveTab: (_to: string) => {},

    isLeftSidebarOpen: false,
    setLeftSidebarOpen: (_open: boolean) => {},
    leftSidebarTabs,
    leftSidebarActiveTab: 'content-manager',
    setLeftSidebarActiveTab: (_id: string) => {},

    isRightSidebarOpen: false,
    setRightSidebarOpen: (_open: boolean) => {},
    rightSidebarTabs,
    rightSidebarActiveTab: '',
    setRightSidebarActiveTab: (_id: string) => {},
});

const TabsProvider: React.FC<TabsProviderProps> = ({ children }) => {
    const [isMounted, setIsMounted] = useState(false);

    const [tabs, setTabs] = useState<Tabs>([]);
    const [activeTab, setActiveTab] = useState(defaultTab);

    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [leftSidebarActiveTab, setLeftSidebarActiveTab] = useState('content-manager');

    const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
    const [rightSidebarActiveTab, setRightSidebarActiveTab] = useState('');

    const router = useRouter();

    useEffect(() => {
        getWindowState().then(state => {
            const lastSelectedTab = state.tabs.find(tab => tab.id === state.lastSelectedTabId);
            if (lastSelectedTab) {
                setActiveTab(lastSelectedTab);
            }
            setTabs(state.tabs);
        });

        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && activeTab) {
            updateLastSelectedTab(activeTab.id);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isMounted) {
            if (tabs.length === 0) {
                // setTimeout(() => {
                //     addTab(defaultTab);
                // }, 60);
                addTab(defaultTab);
            }

            if (!tabs.includes(activeTab) && tabs.length > 0) {
                setActiveTab(tabs[tabs.length - 1]);
            }

            updateTabs(tabs);

            console.log(tabs);
        }
    }, [tabs]);

    const addTab = (tab: Tab) => {
        setTabs(prev => [...prev, tab]);
    };

    const newTab = () => {
        const newId = crypto.randomUUID();
        const newTab: Tab = {
            id: newId,
            name: 'New Tab',
            route: `/tabs/:${newId}`,
        };
        addTab(newTab);
        setActiveTab(newTab);
    };

    const removeTab = (id: string) => {
        const idx = tabs.findIndex(tab => tab.id === id);
        const newTabs = [...tabs.slice(0, idx), ...tabs.slice(idx + 1)];
        setTabs(newTabs);
    };

    const redirectActiveTab = (to: string) => {
        const params = router.state.matches[1].params;
        if ('tabId' in params) {
            const splits = router.history.location.pathname.split('/');

            if (splits[splits.length - 1] !== to) {
                const tabId = params.tabId;
                const newPath = `/tabs/${tabId}/${to}`;

                const newActiveTab: Tab = { ...activeTab, route: newPath };
                setActiveTab(newActiveTab);

                const idx = tabs.findIndex(tab => tab.id === activeTab.id);
                const newTabs = [...tabs.slice(0, idx), newActiveTab, ...tabs.slice(idx + 1)];
                setTabs(newTabs);
            }
        }
    };

    if (!isMounted) return null;

    return (
        <TabsContext.Provider
            value={{
                tabs,
                newTab,
                removeTab,
                activeTab,
                setActiveTab,
                redirectActiveTab,

                isLeftSidebarOpen,
                setLeftSidebarOpen,
                leftSidebarTabs,
                leftSidebarActiveTab,
                setLeftSidebarActiveTab,

                isRightSidebarOpen,
                setRightSidebarOpen,
                rightSidebarTabs,
                rightSidebarActiveTab,
                setRightSidebarActiveTab,
            }}
        >
            {children}
        </TabsContext.Provider>
    );
};

export const useTabsContext = () => {
    const context = React.useContext(TabsContext);

    if (!context) {
        throw new Error('useTabs must be used within the modal provider');
    }

    return context;
};

export default TabsProvider;
