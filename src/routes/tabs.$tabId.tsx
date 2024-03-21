import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/tabs/$tabId')({
    component: Outlet,
});
