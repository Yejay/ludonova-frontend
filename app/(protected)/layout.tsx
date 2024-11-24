// app/(protected)/layout.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardHeader } from '@/components/dashboard/header';

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className='flex h-screen w-screen items-center justify-center bg-background'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<DashboardHeader />
			<div className="flex">
				<DashboardNav />
				<main className="flex-1 p-8 transition-all duration-300">
					{children}
				</main>
			</div>
		</div>
	);
}
