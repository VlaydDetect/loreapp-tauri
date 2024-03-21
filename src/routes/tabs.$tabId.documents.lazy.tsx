import { createLazyFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/tabs/$tabId/documents')({
    component: Outlet,
});
