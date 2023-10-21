import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "remixicon/fonts/remixicon.css"
import "./assets/styles.css";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";
import Providers from "./context/Providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
            <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
                <Providers>
                    <App/>
                </Providers>
            </DevSupport>
    </React.StrictMode>
);
