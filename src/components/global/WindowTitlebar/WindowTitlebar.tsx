import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { useInterval } from '@mantine/hooks';
import {
    VscChromeClose,
    VscChromeMaximize,
    VscChromeMinimize,
    VscChromeRestore,
} from 'react-icons/vsc';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { TooltipProvider, TooltipItem } from '@/components/ui/tooltip';
import { TitlebarTabs } from './Tabs';
import TitlebarSidebar from './TitlebarSidebar';
import { updateLastSelectedTab, updateTabs } from '@/interface';
import { useTabsContext } from '@/context/TabsProvider';

const buttonStyles =
    'tw-w-12 tw-h-[var(--titlebar-height)] tw-duration-200 tw-inline-flex tw-justify-center tw-items-center';
const hoverStyles = 'hover:tw-bg-[#141b2d] active:tw-bg-[#1F2A40]';
const closeHoverStyles = 'hover:tw-bg-[#e81123] active:tw-bg-[#8b0a14]';
const svgStyles = 'tw-align-middle !tw-fill-white';

const WindowTitlebar: React.FC = () => {
    const [maximized, setMaximized] = useState(false);
    const [windowTitle, setWindowTitle] = useState('');
    const [focused, setFocused] = useState(false);

    const { tabs, activeTab, isLeftSidebarOpen, setLeftSidebarOpen } = useTabsContext();

    const tauriInterval = useInterval(() => {
        appWindow.isMaximized().then(setMaximized);
        appWindow.isFocused().then(setFocused);
        appWindow.title().then(title => {
            if (windowTitle !== title) setWindowTitle(title);
        });
    }, 200);

    useEffect(() => {
        tauriInterval.start();
        return tauriInterval.stop;
    }, []);

    const onClose = async () => {
        await updateTabs(tabs);
        await updateLastSelectedTab(activeTab.id);
        await appWindow.close();
    };

    return (
        <div
            data-tauri-drag-region
            className={`tw-h-[var(--titlebar-height)] tw-w-screen ${focused ? 'tw-bg-light-gray' : 'tw-bg-rough-grey/95 tw-border-b-[1px] tw-border-b-light-gray'} tw-flex tw-flex-row tw-select-none tw-justify-start tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-[1000] tw-overflow-hidden tw-scrollbar-hide`}
            id="titlebar"
        >
            <div
                className="tw-flex tw-items-center tw-text-gray-400 tw-pl-1 tw-pr-1 tw-w-[var(--toolbar-width)]"
                onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
            >
                <TooltipProvider>
                    <TooltipItem
                        trigger={
                            isLeftSidebarOpen ? (
                                <PanelLeftClose
                                    size={32}
                                    strokeWidth={1.5}
                                    className="tw-text-gray-400"
                                />
                            ) : (
                                <PanelLeftOpen
                                    size={32}
                                    strokeWidth={1.5}
                                    className="tw-text-gray-400"
                                />
                            )
                        }
                        content={isLeftSidebarOpen ? 'Wrap' : 'Unwrap'}
                        side="right"
                    />
                </TooltipProvider>
            </div>

            <TitlebarSidebar side="left" open={isLeftSidebarOpen} />

            {/*tabs*/}
            <TitlebarTabs focused={focused} />

            {/*<TitlebarSidebar*/}
            {/*    side="left"*/}
            {/*    open={false}*/}
            {/*/>*/}

            {/* window icons */}
            <div className="tw-flex">
                <div
                    title="Minimize"
                    className={`${buttonStyles} ${hoverStyles}`}
                    onClick={() => appWindow.minimize()}
                >
                    <VscChromeMinimize className={svgStyles} />
                </div>
                {maximized ? (
                    <div
                        title="Restore Down"
                        className={`${buttonStyles} ${hoverStyles}`}
                        onClick={() => appWindow.toggleMaximize()}
                    >
                        <VscChromeRestore className={svgStyles} />
                    </div>
                ) : (
                    <div
                        title="Maximize"
                        className={`${buttonStyles} ${hoverStyles}`}
                        onClick={() => appWindow.toggleMaximize()}
                    >
                        <VscChromeMaximize className={svgStyles} />
                    </div>
                )}
                <div
                    title="Close"
                    className={`${buttonStyles} ${closeHoverStyles}`}
                    onClick={() => onClose()}
                >
                    <VscChromeClose className={svgStyles} />
                </div>
            </div>
        </div>
    );
};

export default WindowTitlebar;
