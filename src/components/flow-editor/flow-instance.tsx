import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Edge, EditorNodeType } from './types';
import { useNodeConnections } from './connections-provider';
import { Button } from '@/components/ui/button';

type Props = {
    children: React.ReactNode;
    edges: Edge[];
    nodes: EditorNodeType[];
};

const onCreateNodesEdges = async (
    flowId: string,
    nodes: string,
    edges: string,
    flowPath: string,
) => {
    // TODO: update in db where id = flowId and data = {nodes, edges, flowPath}
    // await flow and if (flow) return { message: 'flow saved' }
};

const FlowInstance: React.FC<Props> = ({ children, edges, nodes }) => {
    const [isFlow, setIsFlow] = useState([]);
    const { nodeConnection } = useNodeConnections();

    const onFlowAutomation = useCallback(async () => {
        const flow = await onCreateNodesEdges(
            pathname.split('/').pop()!,
            JSON.stringify(nodes),
            JSON.stringify(edges),
            JSON.stringify(isFlow),
        );

        if (flow) {
            toast.message(flow.message);
        }
    }, [nodeConnection]);

    return (
        <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-gap-3 tw-p-4">
                <Button onClick={onFlowAutomation} disabled={isFlow.length < 1}>
                    Save
                </Button>
            </div>
            {children}
        </div>
    );
};

export default FlowInstance;
