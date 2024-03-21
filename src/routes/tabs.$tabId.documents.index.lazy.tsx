import { createLazyFileRoute } from '@tanstack/react-router';
import DocumentsIndex from '@/components/documents/DocumentsIndex';

export const Route = createLazyFileRoute('/tabs/$tabId/documents/')({
    component: DocumentsIndex,
});
