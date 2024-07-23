import { createFileRoute } from '@tanstack/react-router';
import TemplatesIndex from '@/components/templates/TemplatesIndex';

export const Route = createFileRoute('/tabs/$tabId/templates/')({
    component: TemplatesIndex,
});
