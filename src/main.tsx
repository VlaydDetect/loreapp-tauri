import React from 'react';
import ReactDOM from 'react-dom/client';
import { DevSupport } from '@react-buddy/ide-toolbox';
import { RouterProvider } from '@tanstack/react-router';
import router from './router';

import { ComponentPreviews, useInitial } from './dev';

import 'remixicon/fonts/remixicon.css';

import './assets/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
            <RouterProvider router={router} />
        </DevSupport>
    </React.StrictMode>,
);
