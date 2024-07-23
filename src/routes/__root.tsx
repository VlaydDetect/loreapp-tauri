import React from 'react';
import { createRootRoute } from '@tanstack/react-router';
import RootLayout from '@/components/global/RootLayout';
import Providers from '@/context/Providers';

const WrappedRoot = () => (
    <Providers>
        <RootLayout />
    </Providers>
);

export const Route = createRootRoute({
    component: WrappedRoot,
});
