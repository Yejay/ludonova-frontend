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

  return (
    <nav className={cn(
      "relative min-h-[calc(100vh-4rem)] border-r border-border bg-background/95 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4 h-8 w-8 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
      </Button>
      
      <div className="space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === item.href 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}