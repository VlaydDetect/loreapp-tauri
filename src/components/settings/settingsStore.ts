import {create} from "zustand";
import {AppSettings} from "@/interface";
import {immer} from "zustand/middleware/immer";
import {TOption} from '@/interface'

interface Settings {
    settings: AppSettings,
    somethingChanged: boolean
    updateSettings: (updatedSettings: AppSettings) => void,
    changeSettings: <T extends keyof AppSettings>(field: T, value: AppSettings[T]) => void,
    toggleSomethingChanged: () => void,
    addCategory: (category: TOption) => void,
    addTag: (tag: TOption) => void,
}

const defaultSettings: AppSettings = {
    editorMode: "normal",
    editor: {
        fontSize: 24,
        cursorPosition: false,
    },
    sortBy: "normal",
    galleryPath: '',
    documentsPath: '',
    categories: [],
    tags: []
}

const useSettingsStore = create<Settings>()(immer(set => ({
    settings: {...defaultSettings},
    somethingChanged: false,
    updateSettings: (updatedSettings) => set(
        {
            settings: {...updatedSettings},
            somethingChanged: true
        }
    ),
    changeSettings: <T extends keyof AppSettings>(field: T, value: AppSettings[T]) => set(state => (
        {
            settings: {...state.settings, [field]: value},
            somethingChanged: true
        }
    )),
    toggleSomethingChanged: () => {
        set(state => ({
            somethingChanged: !state.somethingChanged
        }))
    },
    addCategory: (category: TOption) => set(state => {
        state.settings.categories.push(category)
    }),
    addTag: (tag: TOption) => set(state => {
        state.settings.tags.push(tag)
    }),
})))

export default useSettingsStore
