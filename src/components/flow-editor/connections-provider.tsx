import React, { createContext, useContext, useState } from 'react';

export type ConnectionProviderProps = {
    discordNode: {
        webhookURL: string;
        content: string;
        webhookName: string;
        guildName: string;
    };
    setDiscordNode: React.Dispatch<React.SetStateAction<any>>;
    googleNode: {}[];
    setGoogleNode: React.Dispatch<React.SetStateAction<any>>;
    notionNode: {
        accessToken: string;
        databaseId: string;
        workspaceName: string;
        content: '';
    };
    workflowTemplate: {
        discord?: string;
        notion?: string;
        slack?: string;
    };
    setNotionNode: React.Dispatch<React.SetStateAction<any>>;
    slackNode: {
        appId: string;
        authedUserId: string;
        authedUserToken: string;
        slackAccessToken: string;
        botUserId: string;
        teamId: string;
        teamName: string;
        content: string;
    };
    setSlackNode: React.Dispatch<React.SetStateAction<any>>;
    setWorkFlowTemplate: React.Dispatch<
        React.SetStateAction<{
            discord?: string;
            notion?: string;
            slack?: string;
        }>
    >;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const InitialValues: ConnectionProviderProps = {
    discordNode: {
        webhookURL: '',
        content: '',
        webhookName: '',
        guildName: '',
    },
    googleNode: [],
    notionNode: {
        accessToken: '',
        databaseId: '',
        workspaceName: '',
        content: '',
    },
    workflowTemplate: {
        discord: '',
        notion: '',
        slack: '',
    },
    slackNode: {
        appId: '',
        authedUserId: '',
        authedUserToken: '',
        slackAccessToken: '',
        botUserId: '',
        teamId: '',
        teamName: '',
        content: '',
    },
    isLoading: false,
    setGoogleNode: () => undefined,
    setDiscordNode: () => undefined,
    setNotionNode: () => undefined,
    setSlackNode: () => undefined,
    setIsLoading: () => undefined,
    setWorkFlowTemplate: () => undefined,
};

const ConnectionsContext = createContext(InitialValues);
const { Provider } = ConnectionsContext;

type Props = {
    children: React.ReactNode;
};

const ConnectionsProvider: React.FC<Props> = ({ children }) => {
    const [discordNode, setDiscordNode] = useState(InitialValues.discordNode);
    const [googleNode, setGoogleNode] = useState(InitialValues.googleNode);
    const [notionNode, setNotionNode] = useState(InitialValues.notionNode);
    const [slackNode, setSlackNode] = useState(InitialValues.slackNode);
    const [isLoading, setIsLoading] = useState(InitialValues.isLoading);
    const [workflowTemplate, setWorkFlowTemplate] = useState(InitialValues.workflowTemplate);

    const values = {
        discordNode,
        setDiscordNode,
        googleNode,
        setGoogleNode,
        notionNode,
        setNotionNode,
        slackNode,
        setSlackNode,
        isLoading,
        setIsLoading,
        workflowTemplate,
        setWorkFlowTemplate,
    };

    return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
    const nodeConnection = useContext(ConnectionsContext);

    if (!nodeConnection) {
        throw new Error(
            'useNodeConnections Hook must be used within the node connections Provider',
        );
    }

    return { nodeConnection };
};

export default ConnectionsProvider;
