import { useState, useEffect } from "react";
import {MantineProvider, Center, Loader, MantineThemeOverride} from "@mantine/core";
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals";
import { useHotkeys, useInterval } from "@mantine/hooks";
import { TauriProvider } from "./TauriProvider";
import { useCookie } from "@/hook/useCookie";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const Splashscreen = () => {
	return (
		<Center style={{ height: '100vh', width: '100vw' }}><Loader size="x1"/></Center>
	)
}

/**
 * synchronous hook (for SSR, use mantine's)
 * @param fallback
 */
function usingDarkTheme(fallback = true) {
	const [systemIsDark, setSystemIsDark] = useState(window.matchMedia === undefined ? fallback : window.matchMedia('(prefers-color-scheme: dark)').matches);
	const colorSchemeInterval = useInterval(() => {
		const prefersDarkTheme = window.matchMedia === undefined ? fallback : window.matchMedia('(prefers-color-scheme: dark)').matches;
		if(prefersDarkTheme != prefersDarkTheme) {
			setSystemIsDark(prefersDarkTheme);
		}
	}, 200);
	useEffect(() => {
		colorSchemeInterval.stop();
		return colorSchemeInterval.stop;
	}, []);
	return systemIsDark;
}

export default function Providers({ children }: { children: any }) {
	const systemColorScheme = usingDarkTheme() ? 'dark' : 'light'
	const [savedColorScheme, saveColorScheme] = useCookie('colorScheme')
	const colorScheme = savedColorScheme || systemColorScheme

	function toggleColorScheme(value?: 'dark' | 'light') {
		saveColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
	}

	useHotkeys([
		['mod+J', () => toggleColorScheme()]
	])

	// long tasks should use useState(true)
	const [isLoading, setLoading] = useState(false);

	const theme: MantineThemeOverride = {
		// colors: colorScheme,
		fontFamily: 'Open Sans, sans serif',
		components: {
			Checkbox: { styles: { input: { cursor: 'pointer' }, label: { cursor: 'pointer' } } },
			TextInput: { styles: { label: { marginTop: '0.5rem' } } },
			Select: { styles: { label: { marginTop: '0.5rem' } } },
			Loader: { defaultProps: { size: 'xl' } },
			Space: { defaultProps: { h: 'sm' } },
			Anchor: { defaultProps: { target: '_blank' } }
		},
		other: {
			'.row': {
				display: 'flex',
				alignItems: 'flex-end',
				'& > div': {
					flexGrow: 1,
				}
			},
			'.rowCenter': {
				display: 'flex',
				alignItems: 'center',
				'& > div': {
					flexGrow: 1,
				}
			},
			'.embeddedInput': {
				display: 'inline-block',
				margin: 'auto 5px',
			}
		}
	}

	return (
		<MantineProvider theme={theme} withCssVariables>
			<ModalsProvider>
				<TauriProvider>
					<Notifications/>
					{isLoading ? <Splashscreen/> : children}
				</TauriProvider>
			</ModalsProvider>
		</MantineProvider>
	)
}
