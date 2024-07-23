import React from 'react';
import FlowProvider from './editor-provider';
import ConnectionsProvider from './connections-provider';
import FlowCanvas from './flow-canvas';

type Props = {};

const FlowEditor: React.FC<Props> = ({}) => {
    return (
        <div className="tw-h-full">
            <FlowProvider>
                <ConnectionsProvider>
                    <FlowCanvas />
                </ConnectionsProvider>
            </FlowProvider>
        </div>
    );
};

export default FlowEditor;
