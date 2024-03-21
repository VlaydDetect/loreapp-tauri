import React from "react";
import {SidebarTab} from "@/interface";
import {FolderTree, Bookmark} from "lucide-react";

export const leftSidebarTabs: SidebarTab[] = [
    {
        id: "content-manager",
        name: "Content Manager",
        icon: <FolderTree size={30} strokeWidth={1.5} className="tw-text-gray-400"/>,
    },
    {
        id: "bookmarks",
        name: "Bookmarks",
        icon: <Bookmark size={30} strokeWidth={1.5} className="tw-text-gray-400"/>,
    }
]

export const rightSidebarTabs: SidebarTab[] = []