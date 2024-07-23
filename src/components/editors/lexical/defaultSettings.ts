export const DEFAULT_SETTINGS = {
    disableBeforeInput: false,
    isAutocomplete: false,
    isCharLimit: false,
    isCharLimitUtf8: false,
    isMaxLength: false,
    isRichText: true,
    measureTypingPerf: false,
    shouldUseLexicalContextMenu: true,
    showNestedEditorTreeView: false,
    showTableOfContents: false,
    showTreeView: true,
    tableCellBackgroundColor: true,
    tableCellMerge: true,
};

export type SettingName = keyof typeof DEFAULT_SETTINGS;

export type Settings = typeof DEFAULT_SETTINGS;
