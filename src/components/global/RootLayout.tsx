import React, { useEffect, useRef } from 'react';

import { Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import * as tauriEvent from '@tauri-apps/api/event';

import WindowTitlebar from '@/components/global/WindowTitlebar';
import { useTabsContext } from '@/context/TabsProvider';
import AppToolbar from '@/components/global/AppToolbar';
import AppSidebar from '@/components/global/AppSidebar';

import { notifications } from '@mantine/notifications';

import useSettingsStore from '@/store/settingsStore';
import { SystemTrayPayload } from '@/interface';
import { getSettings } from '@/utils/settings';

import { useMobXStores } from '@/context/mobx-context';

const RootLayout: React.FC = () => {
    const { isLeftSidebarOpen, isRightSidebarOpen, activeTab } = useTabsContext();

    const navigate = useNavigate();
    useEffect(() => {
        // @ts-ignore
        navigate({ to: activeTab.route });
    }, [activeTab]);

    const updateSettings = useSettingsStore(state => state.updateSettings);
    const {
        tagsAndCategoriesStore: { listTagsAndCategories },
        documentsAndFoldersStore: { listDocumentsAndFolders },
    } = useMobXStores();

    useEffect(() => {
        const initSettings = () => {
            getSettings().then(result => {
                updateSettings(result);
            });
        };
        initSettings();
        listTagsAndCategories();
        listDocumentsAndFolders();
    }, []);

    //#region -------- Tauri events listener --------
    const mountID = useRef<number | null>(null);
    const unlistens = useRef<{ [key: number]: tauriEvent.UnlistenFn }>({});

    useEffect(() => {
        const thisMoundID = Math.random();
        mountID.current = thisMoundID;

        // system tray
        tauriEvent
            .listen<SystemTrayPayload>('systemTray', ({ payload }) => {
                if (mountID.current !== thisMoundID) {
                    unlistens.current[thisMoundID]();
                } else {
                    console.log(payload.message);
                    notifications.show({
                        title: '[DEBUG] System Tray Event',
                        message: payload.message,
                    });
                }
            })
            .then(newUnlisten => {
                unlistens.current[thisMoundID] = newUnlisten;
            });

        return () => {
            mountID.current = null;
        };
    }, []);
    //#endregion -------- /Tauri events listener --------

    return (
        <>
            <div className="tw-flex tw-flex-col tw-h-screen tw-w-screen">
                <WindowTitlebar />
                <div className="tw-flex tw-flex-row tw-h-[calc(100vh-var(--titlebar-height))] tw-mt-[var(--titlebar-height)] ">
                    <AppToolbar />
                    <AppSidebar side="left" open={isLeftSidebarOpen} />

                    <main className="tw-flex-auto tw-overflow-hidden">
                        <div
                            className="tw-flex tw-relative tw-overflow-hidden tw-bg-rough-grey"
                            id="App"
                        >
                            <Outlet />
                        </div>
                    </main>

                    {/*<AppSidebar side="right" open={isRightSidebarOpen}/>*/}
                </div>
                <TanStackRouterDevtools />
            </div>
        </>
    );
};

export default RootLayout;
