// components/dashboard/games-list.tsx
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function GamesList() {
  const games = [
    {
      id: 1,
      title: 'The Last of Us Part I',
      platform: 'Steam',
      status: 'Playing',
      progress: 65,
    },
    {
      id: 2,
      title: 'God of War Ragnarök',
      platform: 'PlayStation',
      status: 'Completed',
      progress: 100,
    },
    // Add more games as needed
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">{game.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{game.platform}</Badge>
                  <Badge>{game.status}</Badge>
                </div>
              </div>
              <div className="w-32">
                <Progress value={game.progress} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}