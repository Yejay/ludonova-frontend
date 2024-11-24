// app/(protected)/layout.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

	// const [isCollapsed, setIsCollapsed] = useState(() => {
	// 	if (typeof window !== 'undefined') {
	// 		const saved = localStorage.getItem('sidebarCollapsed')
	// 		return saved === 'true'
	// 	}
	// 	return false
	// })

	// const toggleCollapsed = () => {
	// 	setIsCollapsed(prev => {
	// 		localStorage.setItem('sidebarCollapsed', (!prev).toString())
	// 		return !prev
	// 	})
	// }

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
