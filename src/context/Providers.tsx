import React, { useMemo, useState } from 'react';
import { MantineProvider, Center, Loader, MantineThemeOverride } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import TauriProvider from './TauriProvider';
import TabsProvider from './TabsProvider';
import { ThemeProvider } from './theme-provider';
import { MobXContext } from '@/context/mobx-context';
import RootMobxStore from '@/store/root-mobx-store';
import ModalProvider from '@/context/ModalProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// TODO: add splashscreen when app is loading
const Splashscreen = () => (
    <Center style={{ height: '100vh', width: '100vw' }}>
        <Loader size="x1" />
    </Center>
);

export default function Providers({ children }: { children: React.ReactNode }) {
    // long tasks should use useState(true)
    const [isLoading, setLoading] = useState(false);

    const mantineTheme: MantineThemeOverride = {
        // colors: colorScheme,
        fontFamily: 'Open Sans, sans serif',
        components: {
            Checkbox: { styles: { input: { cursor: 'pointer' }, label: { cursor: 'pointer' } } },
            TextInput: { styles: { label: { marginTop: '0.5rem' } } },
            Select: { styles: { label: { marginTop: '0.5rem' } } },
            Loader: { defaultProps: { size: 'xl' } },
            Space: { defaultProps: { h: 'sm' } },
            Anchor: { defaultProps: { target: '_blank' } },
        },
        other: {
            '.row': {
                display: 'flex',
                alignItems: 'flex-end',
                '& > div': {
                    flexGrow: 1,
                },
            },
            '.rowCenter': {
                display: 'flex',
                alignItems: 'center',
                '& > div': {
                    flexGrow: 1,
                },
            },
            '.embeddedInput': {
                display: 'inline-block',
                margin: 'auto 5px',
            },
        },
    };

    const rootStore = useMemo(() => new RootMobxStore(), []);

    return (
        <MobXContext.Provider value={rootStore}>
            <ThemeProvider>
                <MantineProvider theme={mantineTheme} withCssVariables>
                    <ModalsProvider>
                        <ModalProvider>
                            <TabsProvider>
                                <TauriProvider>
                                    <Notifications />
                                    <Toaster />
                                    <SonnerToaster />
                                    {isLoading ? <Splashscreen /> : children}
                                </TauriProvider>
                            </TabsProvider>
                        </ModalProvider>
                    </ModalsProvider>
                </MantineProvider>
            </ThemeProvider>
        </MobXContext.Provider>
    );
}
