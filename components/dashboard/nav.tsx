// components/dashboard/nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Gamepad,
  LayoutDashboard,
  Library,
  ListTodo,
  Star,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Games',
    href: '/games',
    icon: Gamepad,
  },
  {
    name: 'Library',
    href: '/library',
    icon: Library,
  },
  {
    name: 'Backlog',
    href: '/backlog',
    icon: ListTodo,
  },
  {
    name: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 min-h-[calc(100vh-4rem)] border-r bg-muted/40 p-4">
      <div className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent',
                pathname === item.href ? 'bg-accent' : 'transparent'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}