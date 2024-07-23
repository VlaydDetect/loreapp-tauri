import React, { CSSProperties } from 'react';
import { HandleProps, Handle } from 'reactflow';
import { useFlowEditor } from '@/components/flow-editor/editor-provider';

type Props = HandleProps & { style?: CSSProperties };

const CustomHandle: React.FC<Props> = props => {
    const { state } = useFlowEditor();

    return (
        <Handle
            {...props}
            isValidConnection={e => {
                const sourcesFromHandleInState = state.editor.edges.filter(
                    edge => edge.source === e.source,
                ).length;

                const sourceNode = state.editor.elements.find(node => node.id === e.source);

                const targetFromHandleInState = state.editor.edges.filter(
                    edge => edge.target === e.target,
                ).length;

                if (targetFromHandleInState === 1) return false;
                if (sourceNode?.type === 'Condition') return true;
                if (sourcesFromHandleInState < 1) return true;
                return false;
            }}
            className="!-tw-bottom-2 !tw-h-4 !tw-w-4 dark:tw-bg-neutral-800"
        />
    );
};

export default CustomHandle;
