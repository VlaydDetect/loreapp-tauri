import { createLazyFileRoute } from '@tanstack/react-router';
import GalleryIndex from '@/components/gallery/GalleryIndex';
export const Route = createLazyFileRoute('/tabs/$tabId/gallery/')({
    component: GalleryIndex,
});
