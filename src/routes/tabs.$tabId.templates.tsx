import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/tabs/$tabId/templates')({
    component: Outlet,
});
