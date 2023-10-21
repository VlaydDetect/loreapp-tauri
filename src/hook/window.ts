import {useEffect, useState} from "react";
import { LogicalSize, PhysicalSize, getCurrent, currentMonitor, appWindow } from "@tauri-apps/api/window";

export async function useResizeEffect(minWidth = 1750) {
    useEffect(() => {
        async function resizeWindow() {
            const monitor = await currentMonitor()
            const physicalSize = await getCurrent().innerSize()
            const scaleFactor = monitor?.scaleFactor
            const logicalSize = physicalSize.toLogical(scaleFactor ? scaleFactor : await appWindow.scaleFactor())
            if (logicalSize.width < minWidth) {
                logicalSize.width = minWidth
                await getCurrent().setSize(logicalSize)
            }
        }
        resizeWindow().catch(console.error)
    }, [])
}
