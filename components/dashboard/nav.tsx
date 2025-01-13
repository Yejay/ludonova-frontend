// components/dashboard/nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShieldAlert,
  Wrench,
  Gamepad,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

const baseNavigation = [
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
]

const adminNavigation = [
  {
    name: 'Admin',
    href: '/admin',
    icon: ShieldAlert,
  },
  {
    name: 'Debug',
    href: '/debug',
    icon: Wrench,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  // Combine navigation items based on user role
  const navigation = [
    ...baseNavigation,
    ...(user?.role === 'ADMIN' ? adminNavigation : []),
  ]

  return (
    <nav className={cn(
      "relative border-border bg-background/95 transition-all duration-300",
      // Mobile: bottom navigation
      "md:min-h-[calc(100vh-4rem)] md:border-r fixed bottom-0 left-0 right-0 md:relative",
      // Mobile: full width, desktop: collapsible width
      "h-16 md:h-auto w-full md:w-auto",
      "border-t md:border-t-0",
      "bg-background/80 backdrop-blur-lg md:backdrop-blur-none",
      "z-50",
      isCollapsed ? "md:w-16" : "md:w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4 h-8 w-8 rounded-full border bg-background hidden md:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
      </Button>
      
      <div className={cn(
        "flex md:block",
        "justify-around md:justify-start",
        "px-2 md:p-4",
        "h-full md:h-auto",
        "items-center", // Center items vertically in mobile
        "md:space-y-2"
      )}>
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center transition-colors hover:bg-accent hover:text-accent-foreground',
                // Mobile: centered icons, desktop: left-aligned with text
                'flex-col md:flex-row justify-center md:justify-start',
                'py-1 md:py-2 px-3 md:px-3',
                'text-[11px] md:text-sm font-medium',
                'rounded-lg',
                'min-w-[64px] md:min-w-0', // Ensure minimum touch target width
                pathname === item.href 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground',
                isCollapsed && 'md:justify-center md:px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 mb-0.5 md:mb-0" />
              <span className={cn(
                "mt-0.5 md:mt-0 md:ml-3",
                "line-clamp-1",
                isCollapsed && "md:hidden"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}