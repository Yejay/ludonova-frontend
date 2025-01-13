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
		<div className="min-h-screen bg-background flex flex-col">
			<DashboardHeader />
			<div className="flex-1 flex relative">
				<DashboardNav />
				<main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-x-hidden">
					<div className="max-w-[2000px] mx-auto">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
