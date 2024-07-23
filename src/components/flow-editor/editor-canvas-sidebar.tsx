import React from 'react';
import { CONNECTIONS, EditorCanvasDefaultCardTypes, EditorNodeType, NodeTypes } from './types';
import { useFlowEditor } from './editor-provider';
import { useNodeConnections } from '@/components/flow-editor/connections-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import EditorCanvasIconHelper from './editor-canvas-icon-helper';
import RenderConnectionAccordion from './render-connection-accordion';

type Props = {
    nodes: EditorNodeType[];
};

const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeTypes) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
};

const EditorCanvasSidebar: React.FC<Props> = ({ nodes }) => {
    const { state } = useFlowEditor();
    const { nodeConnection } = useNodeConnections();

    return (
        <aside>
            <Tabs defaultValue="actions" className="tw-h-screen tw-overflow-scroll tw-pb-24">
                <TabsList className="tw-bg-transparent">
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <Separator />
                <TabsContent value="actions" className="tw-flex tw-flex-col tw-gap-4 tw-p-4">
                    {Object.entries(EditorCanvasDefaultCardTypes)
                        .filter(
                            ([_, cardType]) =>
                                (!nodes.length && cardType.type === 'Trigger') ||
                                (nodes.length && cardType.type === 'Action'),
                        )
                        .map(([cardKey, cardValue]) => (
                            <Card
                                key={cardKey}
                                draggable
                                className="tw-w-full tw-cursor-grab tw-border-black tw-bg-neutral-100 dark:tw-border-neutral-700 dark:tw-bg-neutral-900"
                                onDragStart={event => onDragStart(event, cardKey as NodeTypes)}
                            >
                                <CardHeader className="tw-flex tw-flex-row tw-items-center tw-gap-4 tw-p-4">
                                    <EditorCanvasIconHelper type={cardKey as NodeTypes} />
                                    <CardTitle className="tw-twxt-md">
                                        {cardKey}
                                        <CardDescription>{cardValue.description}</CardDescription>
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                </TabsContent>
                <TabsContent value="actions" className="-tw-mt-6">
                    <div className="tw-px-2 tw-py-4 tw-text-center tw-text-xl tw-font-bold">
                        {state.editor.selectedNode?.data.title}
                    </div>

                    <Accordion type="multiple">
                        <AccordionItem value="Options" className="tw-border-y-[1px] tw-px-2">
                            <AccordionTrigger className="!tw-no-underline">
                                Details
                            </AccordionTrigger>
                            <AccordionContent>
                                {CONNECTIONS.map(c => (
                                    <RenderConnectionAccordion
                                        key={c.title}
                                        state={state}
                                        connection={c}
                                    />
                                ))}{' '}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="Expected Output" className="tw-px-2">
                            <AccordionTrigger className="!tw-no-underline">Action</AccordionTrigger>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>
            </Tabs>
        </aside>
    );
};

export default EditorCanvasSidebar;
