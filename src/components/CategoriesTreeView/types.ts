import React from "react";

export type TMouseEvent = React.MouseEvent<Element, MouseEvent>;

export enum EMenuAction {
    Create,
    CreateAndAttach,
    Rename,
    Delete
}

export const ACTIONS_IF_NODE_IS_SELECTED = [EMenuAction.Create, EMenuAction.CreateAndAttach, EMenuAction.Rename, EMenuAction.Delete];
export const ACTIONS_IF_NODE_IS_UNDEFINED = [EMenuAction.Create];
