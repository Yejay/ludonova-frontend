import '@/app/globals.css';

import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { type ReactNode } from 'react';

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<>
			<html lang='en' suppressHydrationWarning>
				<head />
				<body>
					<AuthProvider>
						<ThemeProvider
							attribute='class'
							defaultTheme='system'
							enableSystem
							disableTransitionOnChange
						>
							{children}
						</ThemeProvider>
					</AuthProvider>
				</body>
			</html>
		</>
	);
}
