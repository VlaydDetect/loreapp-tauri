import React from "react";
import {ComponentPreview, Previews} from "@react-buddy/ide-toolbox";
import {PaletteTree} from "./palette";
import Settings from "@/components/settings/Settings";
import Gallery from "@/pages/Gallery";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/Settings">
                <Settings/>
            </ComponentPreview>
            <ComponentPreview path="/Gallery">
                <Gallery/>
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;
