import React from 'react';
import { useTemplatesEditor } from '../editor-provider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import TabList from './tabs';
import { cn } from '@/utils';
import SettingsTab from './tabs/settings-tab';
import MediaBucketTab from './tabs/media-bucket-tab';
import ComponentsTab from './tabs/components-tab';

type Props = {};

const EditorSidebar: React.FC<Props> = ({}) => {
    const { state, dispatch } = useTemplatesEditor();

    return (
        <Sheet open modal={false}>
            <Tabs className="tw-w-full" defaultValue="Settings">
                <SheetContent
                    showX={false}
                    side="right"
                    className={cn(
                        'tw-mt-[117px] !tw-w-16 tw-z-[80] tw-shadow-none tw-p-0 focus:tw-border-none tw-transition-all tw-overflow-hidden',
                        { 'tw-hidden': state.editor.previewMode },
                    )}
                >
                    <TabList />
                </SheetContent>
                <SheetContent
                    showX={false}
                    side="right"
                    className={cn(
                        'tw-mt-[117px] tw-w-80 tw-z-[40] tw-shadow-none tw-p-0 tw-mr-16 tw-bg-background tw-h-full tw-transition-all tw-overflow-hidden ',
                        { 'tw-hidden': state.editor.previewMode },
                    )}
                >
                    <div className="tw-grid tw-gap-4 tw-h-full tw-pb-36 tw-overflow-y-scroll tw-scrollbar-hide">
                        <TabsContent value="Settings">
                            <SheetHeader className="tw-text-left tw-p-6">
                                <SheetTitle>Styles</SheetTitle>
                                <SheetDescription>
                                    Show your creativity! You can customize every component as you
                                    like.
                                </SheetDescription>
                            </SheetHeader>
                            <SettingsTab />
                        </TabsContent>
                        <TabsContent value="Media">
                            <MediaBucketTab />
                        </TabsContent>
                        <TabsContent value="Components">
                            <SheetHeader className="tw-text-left tw-p-6 ">
                                <SheetTitle>Components</SheetTitle>
                                <SheetDescription>
                                    You can drag and drop components on the canvas
                                </SheetDescription>
                            </SheetHeader>
                            <ComponentsTab />
                        </TabsContent>
                    </div>
                </SheetContent>
            </Tabs>
        </Sheet>
    );
};

export default EditorSidebar;
