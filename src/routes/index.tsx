import React, { useEffect } from 'react';
import { createFileRoute, useNavigate, Outlet } from '@tanstack/react-router';
import { useTabsContext } from '@/context/TabsProvider';

const Index: React.FC = () => {
    return <Outlet />;
    // return null;
};

export const Route = createFileRoute('/')({
    component: Index,
});
