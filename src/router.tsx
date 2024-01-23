import React from "react";
import {createHashRouter, Outlet} from "react-router-dom";
import Gallery from "@/pages/Gallery";
import PictureDetailsWrapper from "@/components/gallery/PictureDetails";
import Team from "@/pages/Dashboard/Team";
import Contacts from "@/pages/Dashboard/Contacts";
import Invoices from "@/pages/Dashboard/Invoices";
import Form from "@/components/dashboard/Form";
import Bar from "@/pages/Dashboard/Bar";
import Pie from "@/pages/Dashboard/Pie";
import Line from "@/pages/Dashboard/Line";
import FAQ from "@/pages/Dashboard/FAQ";
import Calendar from "@/pages/Dashboard/Calendar";
import Geography from "@/pages/Dashboard/Geography";
import Settings from "@/components/settings/Settings";
import AppSidebar from "@/components/dashboard/global/AppSidebar";
import Topbar from "@/components/dashboard/global/Topbar";
import Documents from "@/pages/Documents";
import DocumentWrapper from "@/components/documents/Document";

const Root: React.FC = () => {
    return (
        <>
            <AppSidebar />
            <main className="content">
                <Topbar />
                <Outlet/>
            </main>
        </>
    );
};

const router = createHashRouter([
    {
        path: '/',
        element: <Root/>,
        children: [
            {
                path: '/gallery',
                element: <Gallery />,
            },
            {
                path: '/pic-detail/:picId',
                element: <PictureDetailsWrapper/>
            },
            {
                path: '/document/:docId',
                element: <DocumentWrapper/>
            },
            {
                path: '/team',
                element: <Team/>
            },
            {
                path: '/contacts',
                element: <Contacts/>
            },
            {
                path: '/invoices',
                element: <Invoices/>
            },
            {
                path: '/form',
                element: <Form/>
            },
            {
                path: '/bar',
                element: <Bar/>
            },
            {
                path: '/pie',
                element: <Pie/>
            },
            {
                path: '/line',
                element: <Line/>
            },
            {
                path: '/faq',
                element: <FAQ/>
            },
            {
                path: '/calendar',
                element: <Calendar/>
            },
            {
                path: '/geography',
                element: <Geography/>
            },
            {
                path: '/settings',
                element: <Settings/>
            },
        ]
    },
])

export default router
