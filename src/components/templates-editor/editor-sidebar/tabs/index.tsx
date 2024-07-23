import React from 'react';
import { Plus, Settings, SquareStack, Database } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const TabList: React.FC = () => {
    return (
        <TabsList className="tw-flex tw-items-center tw-flex-col tw-justify-evenly tw-w-full tw-bg-transparent tw-h-fit tw-gap-4 ">
            <TabsTrigger
                value="Settings"
                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
            >
                <Settings />
            </TabsTrigger>
            <TabsTrigger
                value="Components"
                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
            >
                <Plus />
            </TabsTrigger>

            <TabsTrigger
                value="Layers"
                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
            >
                <SquareStack />
            </TabsTrigger>
            <TabsTrigger
                value="Media"
                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
            >
                <Database />
            </TabsTrigger>
        </TabsList>
    );
};

export default TabList;
