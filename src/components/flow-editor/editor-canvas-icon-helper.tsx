import React from 'react';
import {
    Calendar,
    CircuitBoard,
    Database,
    GitBranch,
    HardDrive,
    Mail,
    MousePointerClickIcon,
    Plus,
    Timer,
    Webhook,
    Zap,
} from 'lucide-react';
import { NodeTypes } from './types';

type Props = { type: NodeTypes };

const EditorCanvasIconHelper: React.FC<Props> = ({ type }) => {
    switch (type) {
        case 'Trigger':
            return <CircuitBoard className="tw-flex-shrink-0" size={30} />;
        case 'b':
            return <Webhook className="tw-flex-shrink-0" size={30} />;
        case 'Condition':
            return <GitBranch className="tw-flex-shrink-0" size={30} />;
        default:
            return <Zap className="tw-flex-shrink-0" size={30} />;
    }
};

export default EditorCanvasIconHelper;
