import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/tabs/$tabId/gallery')({
    component: Outlet,
});
