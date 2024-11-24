// app/(protected)/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'

export default function DebugPage() {
  const { user, logout } = useAuth()

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="font-semibold">User Info:</h2>
            <pre className="bg-muted p-4 rounded-lg mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <Button onClick={logout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}