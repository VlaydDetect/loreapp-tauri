import React from "react";

export type TDragEvent = React.DragEvent<HTMLLIElement>;
export type TMouseEvent = React.MouseEvent<HTMLElement, MouseEvent>;
export type TSelectEvent = React.SyntheticEvent<Element, Event>;

export enum EMenuAction {
    Create,
    CreateAndAttach,
    Rename,
    Delete
}

export const ACTIONS_IF_NODE_IS_SELECTED = [EMenuAction.Create, EMenuAction.CreateAndAttach, EMenuAction.Rename, EMenuAction.Delete];
export const ACTIONS_IF_NODE_IS_UNDEFINED = [EMenuAction.Create];