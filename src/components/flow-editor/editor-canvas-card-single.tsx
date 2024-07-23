import React, { useMemo } from 'react';
import { Position, useNodeId } from 'reactflow';
import { CardType } from '@/components/flow-editor/types';
import { useFlowEditor } from '@/components/flow-editor/editor-provider';
import EditorCanvasIconHelper from './editor-canvas-icon-helper';
import CustomHandle from './custom-handle';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils';

type Props = {
    data: CardType;
};

const EditorCanvasCardSingle: React.FC<Props> = ({ data }) => {
    const { state, dispatch } = useFlowEditor();
    const nodeId = useNodeId();

    const logo = useMemo(() => <EditorCanvasIconHelper type={data.type} />, [data]);

    return (
        <>
            {data.type !== 'Trigger' && (
                <CustomHandle type="target" position={Position.Top} style={{ zIndex: 100 }} />
            )}
            <Card
                onClick={e => {
                    e.stopPropagation();
                    const val = state.editor.elements.find(n => n.id === nodeId);
                    if (val) {
                        dispatch({
                            type: 'SELECTED_ELEMENT',
                            payload: { element: val },
                        });
                    }
                }}
                className="tw-relative tw-max-w-[400px] dark:tw-border-muted-foreground/70"
            >
                <CardHeader className="tw-flex tw-flex-row tw-items-center tw-gap-4">
                    <div>{logo}</div>
                    <div>
                        <CardTitle className="tw-text-md">{data.title}</CardTitle>
                        <CardDescription>
                            <p className="tw-text-xs tw-text-muted-foreground/50">
                                <b className="tw-text-muted-foreground/80">ID: </b>
                                {nodeId}
                            </p>
                            <p>{data.description}</p>
                        </CardDescription>
                    </div>
                </CardHeader>
                <Badge variant="secondary" className="tw-absolute tw-right-2 tw-top-2">
                    {data.type}
                </Badge>
                <div
                    className={cn('tw-absolute tw-left-3 tw-top-3 tw-h-2 tw-w-2 tw-rounded-full', {
                        'tw-bg-green-500': Math.random() < 0.6,
                        'tw-bg-orange-500': Math.random() >= 0.6 && Math.random() < 0.8,
                        'tw-bg-red-500': Math.random() >= 0.8,
                    })}
                ></div>
            </Card>
            <CustomHandle type="source" position={Position.Bottom} id="a" />
        </>
    );
};

export default EditorCanvasCardSingle;
