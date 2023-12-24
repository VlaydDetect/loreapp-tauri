import { FC, useState, useEffect } from "react";
import {Dropdown, MenuButton, Menu, MenuItem} from "@mui/base";
import {Divider, Typography} from '@mui/material';
import { Text, UnstyledButton } from "@mantine/core";
import {useTheme, createTheme} from "@mui/material/styles";
import { useInterval } from "@mantine/hooks";
import { appWindow } from "@tauri-apps/api/window";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore } from "react-icons/vsc";
import AppIcon from "../../src-tauri/icons/32x32.png"
import './windowTitlebar.scss';

export const WindowTitlebar: FC = () => {
    const theme = useTheme();
    const [maximized, setMaximized] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [windowTitle, setWindowTitle] = useState('')

    const tauriInterval = useInterval(() => {
        appWindow.isMaximized().then(setMaximized)
        appWindow.isFullscreen().then(setFullscreen)
        appWindow.title().then(title => {
            if (windowTitle !== title) setWindowTitle(title)
        })
    }, 200)

    useEffect(() => {
        tauriInterval.start()
        return tauriInterval.stop
    }, []);

    return fullscreen ? null : (
        <div data-tauri-drag-region className="titlebar" id='titlebar'>
            <div>
                {/* window icon */}
                <Dropdown>
                    <MenuButton>
                        <img className="titlebarIcon" height={16} src={AppIcon} alt={'titlebarIcon'}/>
                    </MenuButton>

                    <Menu>
                        <MenuItem onClick={() => appWindow.minimize()}><VscChromeMinimize size={14}/>Minimize</MenuItem>

                        {maximized ?
                            (<MenuItem onClick={() => appWindow.toggleMaximize()}><VscChromeRestore size={14} />Restore Down</MenuItem>) :
                            (<MenuItem onClick={() => appWindow.toggleMaximize()}><VscChromeMaximize size={14} />Maximize</MenuItem>)
                        }

                        <Divider/>

                        <MenuItem onClick={() => appWindow.close()}><VscChromeClose size={14} />Close <Typography variant='body2' color="text.secondary">Alt + F4</Typography></MenuItem>
                    </Menu>
                </Dropdown>
                {/* left window title */}
                <Text data-tauri-drag-region inline className="titlebarLabel" size='xs'>{windowTitle}</Text>
            </div>

            {/* center window title */}
            <div>
                {/* window icons */}
                <div title='Minimize' className="titlebarButton titlebarDefaultHover" onClick={() => appWindow.minimize()}>
                    <VscChromeMinimize className="verticalAlign" />
                </div>
                {maximized ?
                    (
                        <div title='Restore Down' className="titlebarButton titlebarDefaultHover" onClick={() => appWindow.toggleMaximize()}>
                            <VscChromeRestore className="verticalAlign" />
                        </div>
                    ) :
                    (
                        <div title='Maximize' className="titlebarButton titlebarDefaultHover" onClick={() => appWindow.toggleMaximize()}>
                            <VscChromeMaximize className="verticalAlign" />
                        </div>
                    )
                }
                <div title='Close' className="titlebarButton titlebarCloseHover" onClick={() => appWindow.close()}>
                    <VscChromeClose className="verticalAlign" />
                </div>
            </div>
        </div>
    )
}
