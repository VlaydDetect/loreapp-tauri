import React from 'react';
import { invoke } from '@tauri-apps/api';
import { LabelValue } from '@/interface/LabelValue';
import { CategoryNode } from '@/interface/CategoryNode';
import { CategoriesTree } from '@/interface/CategoriesTree';

export const createLabelValue = (label: string): LabelValue => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: label.toLowerCase().replace(/\W/g, ''), // TODO: replace ' ' with '-'
});

export const findLabelValueByLabel = (options: LabelValue[], label: string) =>
    options.find(opt => opt.label === label);

export const findLabelValueByValue = (options: LabelValue[], value: string) =>
    options.find(opt => opt.value === value);

export const findCategoryParent = (id: string, tree: CategoriesTree): CategoryNode | undefined => {
    if (tree.nodes.length === 0) return undefined;
    const findInChildren = (node: CategoryNode): CategoryNode | undefined => {
        if (node.children.length === 0) return undefined;

        // eslint-disable-next-line no-restricted-syntax
        for (const child of node.children) {
            if (child.id === id) return child;

            const parent = findInChildren(child);
            if (parent) return child;
        }

        return undefined;
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const node of tree.nodes) {
        if (node.id === id) return undefined;

        const parent = findInChildren(node);
        if (parent) return node;
    }

    return undefined;
};

export const isCategoryChild = (id: string, tree: CategoriesTree): boolean =>
    !!findCategoryParent(id, tree);

//#region ------------------------------ Window Titlebar ------------------------------
export type Tab = {
    id: string;
    name: string;
    route: string;
};

export const defaultTab: Tab = {
    id: '0',
    name: 'New Tab',
    route: '/tabs/:0',
};

export type Tabs = Tab[];

export type SidebarTab = {
    id: string;
    name: string;
    icon: React.ReactNode;
};
//#endregion ------------------------------ Window Titlebar ------------------------------

//#region ------------------------------ Window State ------------------------------
type WindowState = {
    width: number;
    height: number;
    x: number;
    y: number;
    prev_x: number;
    prev_y: number;
    maximized: boolean;
    visible: boolean;
    decorated: boolean;
    fullscreen: boolean;
    tabs: Tabs;
    lastSelectedTabId: string;
};

export const updateTabs = (tabs: Tabs): Promise<void> =>
    invoke<void>('plugin:window-state|update_tabs', { tabs });
export const updateLastSelectedTab = (id: string): Promise<void> =>
    invoke<void>('plugin:window-state|update_last_selected_tab', { id });
export const getWindowState = (): Promise<WindowState> =>
    invoke<WindowState>('plugin:window-state|load_state');
//#endregion ------------------------------ Window State ------------------------------
