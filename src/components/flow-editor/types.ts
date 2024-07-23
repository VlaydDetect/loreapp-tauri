import { z } from 'zod';
import { ConnectionProviderProps } from './connections-provider';

export type NodeTypes = 'Trigger' | 'b' | 'Condition';

export type Edge = {
    id: string;
    source: string;
    target: string;
};

export type CardType = {
    title: string;
    description: string;
    completed: boolean;
    current: boolean;
    metadata: any;
    type: NodeTypes;
};

export type EditorNodeType = {
    id: string;
    type: CardType['type'];
    position: {
        x: number;
        y: number;
    };
    data: CardType;
};

export type EditorActions =
    | {
          type: 'LOAD_DATA';
          payload: {
              elements: EditorNodeType[];
              edges: Edge[];
          };
      }
    | {
          type: 'UPDATE_NODE';
          payload: {
              elements: EditorNodeType[];
          };
      }
    | { type: 'REDO' }
    | { type: 'UNDO' }
    | {
          type: 'SELECTED_ELEMENT';
          payload: {
              element: EditorNodeType;
          };
      };

export const EditorCanvasDefaultCardTypes: Record<
    NodeTypes,
    { description: string; type: 'Action' | 'Trigger' }
> = {
    Condition: {
        description: 'Boolean operator that creates different conditions lanes.',
        type: 'Action',
    },
    Trigger: {
        description: 'An event that starts the workflow.',
        type: 'Trigger',
    },
    b: {
        description: 'b is a b',
        type: 'Action',
    },
};

export const WorkflowFormSchema = z.object({
    name: z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
});

export type ConnectionTypes = 'Google Drive' | 'Notion' | 'Slack' | 'Discord';

export type Connection = {
    title: ConnectionTypes;
    description: string;
    image: string;
    connectionKey: keyof ConnectionProviderProps;
    accessTokenKey?: string;
    alwaysTrue?: boolean;
    slackSpecial?: boolean;
};

export const CONNECTIONS: Connection[] = [
    {
        title: 'Google Drive',
        description: 'Connect your google drive to listen to folder changes',
        image: '/googleDrive.png',
        connectionKey: 'googleNode',
        alwaysTrue: true,
    },
    {
        title: 'Discord',
        description: 'Connect your discord to send notification and messages',
        image: '/discord.png',
        connectionKey: 'discordNode',
        accessTokenKey: 'webhookURL',
    },
    {
        title: 'Notion',
        description: 'Create entries in your notion dashboard and automate tasks.',
        image: '/notion.png',
        connectionKey: 'notionNode',
        accessTokenKey: 'accessToken',
    },
    {
        title: 'Slack',
        description: 'Use slack to send notifications to team members through your own custom bot.',
        image: '/slack.png',
        connectionKey: 'slackNode',
        accessTokenKey: 'slackAccessToken',
        slackSpecial: true,
    },
];
