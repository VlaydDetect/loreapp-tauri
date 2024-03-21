// import React from 'react';
// import { createHashRouter, Outlet, RouteObject } from 'react-router-dom';
// import RootLayout from '@/components/global/RootLayout';
//
// import Gallery from '@/pages/Gallery';
// import GalleryIndex from '@/components/gallery/GalleryIndex';
// import PictureDetailsWrapper from '@/components/gallery/PictureDetails';
//
// import Documents from '@/pages/Documents';
// import DocumentsIndex from '@/components/documents/DocumentsIndex';
// import DocumentWrapper from '@/components/documents/Document';
//
// import { EmptyTab } from '@/components/global/WindowTitlebar/Tabs';
//
// type BaseRouterObject = {
//     path: string;
//     icon: React.ReactNode; // TODO: Or other Icon type (Do we need to create shared icon type?)
//     name: string;
// };
//
// type TabsRouteObject = BaseRouterObject & {
//     element: React.ReactNode;
//     children?: RouteObject[];
// };
//
// const TABS_PATH = '/tabs/:tabId';
//
// // type ModalRouterObject = BaseRouterObject & {
// //     modal: React.ReactNode, // TODO: Does exist modal type?
// // };
//
// // See: https://github.com/remix-run/react-router/blob/dev/examples/route-objects/src/App.tsx
// export const tabsRoutes: TabsRouteObject[] = [
//     {
//         path: `${TABS_PATH}/gallery`,
//         element: <Gallery />,
//         icon: null,
//         name: 'Gallery',
//         children: [
//             { index: true, element: <GalleryIndex /> },
//             {
//                 path: `${TABS_PATH}/gallery/:picId`,
//                 element: <PictureDetailsWrapper />,
//             },
//         ],
//     },
//     {
//         path: `${TABS_PATH}/documents`,
//         element: <Documents />,
//         icon: null,
//         name: 'Documents',
//         children: [
//             { index: true, element: <DocumentsIndex /> },
//             {
//                 path: `${TABS_PATH}/documents/:docId`,
//                 element: <DocumentWrapper />,
//             },
//         ],
//     },
// ];
//
// // export const modalRoutes: ModalRouterObject[] = [
// //     {
// //         path: '/settings',
// //         icon: null,
// //         name: "Settings",
// //         element: <Settings/>
// //     },
// // ]
// //
// // export const newWindowRoutes: TabsRouteObject[] = [
// //
// // ]
//
// const router = createHashRouter([
//     {
//         path: '/',
//         element: <RootLayout />,
//         children: [
//             {
//                 path: '/tabs/:tabId',
//                 element: <Outlet />,
//                 children: [
//                     { index: true, element: <EmptyTab /> },
//                     ...tabsRoutes.map(
//                         options =>
//                             ({
//                                 path: options.path,
//                                 element: options.element,
//                                 children: options.children,
//                             }) as RouteObject,
//                     ),
//                 ],
//             },
//         ],
//     },
// ]);
//
// export default router;

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        // This infers the type of our router and registers it across your entire project
        router: typeof router;
    }
}

export default router;
