import {createContext, useContext} from "react";
import RootMobxStore from "@/store/root-mobx-store";

export const MobXContext = createContext<RootMobxStore | null>(null);

export const useMobXStores = () => {
    const context = useContext(MobXContext);

    if (context === null) {
        throw new Error("MobX context is not initialized (is null)");
    }

    return context;
}