import React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';

const Index: React.FC = () => <Outlet />;

export const Route = createFileRoute('/')({
    component: Index,
});
