import { createFileRoute } from '@tanstack/react-router';
import { EmptyTab } from '@/components/global/WindowTitlebar/Tabs';

export const Route = createFileRoute('/tabs/$tabId/')({
    component: EmptyTab,
});
