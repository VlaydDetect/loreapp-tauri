import React from 'react';
import { Connection } from './types';
import { EditorState } from './editor-provider';
import { useNodeConnections } from './connections-provider';

type Props = {
    connection: Connection;
    state: EditorState;
};

const RenderConnectionAccordion: React.FC<Props> = ({ connection, state }) => {
    const { title, image, description, connectionKey, accessTokenKey, alwaysTrue, slackSpecial } =
        connection;
    const { nodeConnection } = useNodeConnections();

    return <div></div>;
};

export default RenderConnectionAccordion;
