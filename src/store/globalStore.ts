import { create } from "zustand"
import { immer } from "zustand/middleware/immer";

interface Global {

}

export const useGlobalStore = create<Global>()(immer(set => ({

})))