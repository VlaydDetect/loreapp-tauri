import React from "react";
import {Fragment} from "react";
import {
    Category,
    Component,
    Variant,
    Palette,
} from "@react-buddy/ide-toolbox";
import AntdPalette from "@react-buddy/palette-antd";
import MantinePalette from "@react-buddy/palette-mantine-core";
import MantinePalette1 from "@react-buddy/palette-mantine-form";
import MantinePalette2 from "@react-buddy/palette-mantine-dates";
import MUIPalette from "@react-buddy/palette-mui";

export const PaletteTree = () => (
    <Palette>
        <Category name="App">
            <Component name="Loader">
                <Variant>
                    <ExampleLoaderComponent/>
                </Variant>
            </Component>
        </Category>
        <AntdPalette/>
        <MantinePalette/>
        <MantinePalette1/>
        <MantinePalette2/>
        <MUIPalette/>
    </Palette>
);

export function ExampleLoaderComponent() {
    return (
        <Fragment>Loading...</Fragment>
    );
}