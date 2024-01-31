import React, { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import "./assets/App.css";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { Button, Text, useMantineColorScheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import * as tauriEvent from '@tauri-apps/api/event';
import { relaunch } from '@tauri-apps/api/process';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { SystemTrayPayload } from './interface'
import {getSettings} from "@/utils/settings";
import useSettingsStore from "@/store/settingsStore";

import router from "@/router";
import {useMobXStores} from "@/context/mobx-context";

const App: React.FC = () => {
    const updateSettings = useSettingsStore(state => state.updateSettings);
    const { tagsAndCategoriesStore: { listTagsAndCategories } } = useMobXStores();

    useEffect(() => {
        const initSettings = () => {
            getSettings().then(result => {
                updateSettings(result)
            })
        }
        initSettings()
        listTagsAndCategories();
    }, []);

    //#region -------- Tauri events listener --------
    const mountID = useRef<number | null>(null)
    const unlistens = useRef<{ [key: number]: tauriEvent.UnlistenFn }>({})

    useEffect(() => {
        const thisMoundID = Math.random()
        mountID.current = thisMoundID
        // updates
        checkUpdate().then(({ shouldUpdate, manifest }) => {
            if (shouldUpdate && manifest) {
                const { version: newVersion, body: releaseNotes } = manifest
                const color = 'teal'
                notifications.show({
                    title: `Update v${newVersion} available`,
                    color,
                    message: (
                        <>
                            <Text>{releaseNotes}</Text>
                            <Button color={color} style={{ width: '100%' }} onClick={() => {
                                notifications.show({
                                    title: `Installing update v${newVersion}`,
                                    message: "Will relaunch afterwards",
                                    autoClose: false
                                })
                                installUpdate().then(relaunch)
                            }}>Install update and relaunch</Button>
                        </>
                    ),
                    autoClose: false
                })
            }
        })

        // system tray
        tauriEvent.listen<SystemTrayPayload>("systemTray", ({ payload }) => {
            if (mountID.current !== thisMoundID) {
                unlistens.current[thisMoundID]()
            } else {
                console.log(payload.message)
                notifications.show({
                    title: "[DEBUG] System Tray Event",
                    message: payload.message
                })
            }
        }).then(newUnlisten => { unlistens.current[thisMoundID] = newUnlisten })

        return () => { mountID.current = null }
    }, []);
    //#endregion -------- /Tauri events listener --------


    const [theme, colorMode] = useMode();

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="App">
                    <RouterProvider router={router}/>
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
