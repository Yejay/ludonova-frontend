// app/(protected)/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api/client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'

export default function DebugPage() {
  const { user } = useAuth()
  const [syncResult, setSyncResult] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)

  const testSteamSync = async () => {
    setIsSyncing(true)
    setSyncResult('Starting Steam sync...\n')
    try {
      const startTime = Date.now()
      await api.post('/steam/sync')
      const duration = (Date.now() - startTime) / 1000
      setSyncResult(prev => prev + `Steam sync completed in ${duration} seconds\n`)
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorDetails = error.response?.data
        setSyncResult(prev => prev + [
          'Error syncing Steam library:',
          `Status: ${error.response?.status}`,
          `Message: ${errorDetails?.message || error.message}`,
          errorDetails?.trace ? `Stack trace: ${errorDetails.trace}` : '',
          `Full response: ${JSON.stringify(errorDetails, null, 2)}`
        ].filter(Boolean).join('\n') + '\n')
      } else {
        setSyncResult(prev => prev + `Unknown error: ${error}\n`)
      }
      console.error('Steam sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-4xl font-bold">Debug Page</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Steam Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Steam Status</h3>
              <p className="text-sm text-muted-foreground">
                {user?.steamUser ? 'Connected to Steam' : 'Not connected to Steam'}
              </p>
              {user?.steamUser && (
                <>
                  <p className="text-sm">Steam ID: {user.steamUser.steamId}</p>
                  <p className="text-sm">Steam Username: {user.steamUser.personaName}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Steam Library Test</h3>
              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    try {
                      setSyncResult('Fetching Steam library...\n')
                      const response = await api.get('/steam/library')
                      setSyncResult(prev => prev + `Successfully fetched Steam library:\n${JSON.stringify(response.data, null, 2)}\n`)
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        const errorDetails = error.response?.data
                        setSyncResult(prev => prev + [
                          'Error fetching Steam library:',
                          `Status: ${error.response?.status}`,
                          `Message: ${errorDetails?.message || error.message}`,
                          errorDetails?.trace ? `Stack trace: ${errorDetails.trace}` : '',
                          `Full response: ${JSON.stringify(errorDetails, null, 2)}`
                        ].filter(Boolean).join('\n') + '\n')
                      } else {
                        setSyncResult(prev => prev + `Unknown error: ${error}\n`)
                      }
                      console.error('Steam library fetch error:', error)
                    }
                  }}
                  disabled={!user?.steamUser || isSyncing}
                >
                  Fetch Steam Library
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      setSyncResult('Starting Steam sync...\n')
                      const libraryResponse = await api.get('/steam/library')
                      const games = libraryResponse.data.response.games
                      
                      setSyncResult(prev => prev + `Found ${games.length} games in Steam library\n`)
                      
                      for (const game of games.slice(0, 100)) { // Import first 5 games for testing
                        setSyncResult(prev => prev + `\nImporting game: ${game.name}...\n`)
                        try {
                          // First search for the game in RAWG
                          const rawgResponse = await api.get('/games', {
                            params: {
                              query: game.name,
                              page: 0,
                              size: 1
                            }
                          })

                          let gameId;
                          if (rawgResponse.data.content.length > 0) {
                            // Use existing game from our database
                            gameId = rawgResponse.data.content[0].id;
                          } else {
                            // Create new game with Steam data
                            const gameResponse = await api.post('/games', {
                              title: game.name,
                              apiId: game.appid.toString(),
                              source: 'STEAM',
                              backgroundImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
                            })
                            gameId = gameResponse.data.id;
                          }
                          
                          // Add game to user's library
                          const response = await api.post('/game-instances', {
                            gameId: gameId,
                            status: 'PLAYING',
                            playTime: game.playtime_forever,
                            lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null
                          })
                          setSyncResult(prev => prev + `Successfully imported ${game.name}\n`)
                        } catch (error) {
                          setSyncResult(prev => prev + `Failed to import ${game.name}: ${error}\n`)
                        }
                      }
                      
                      setSyncResult(prev => prev + '\nFinished importing games\n')
                    } catch (error) {
                      if (error instanceof AxiosError) {
                        const errorDetails = error.response?.data
                        setSyncResult(prev => prev + [
                          'Error during import:',
                          `Status: ${error.response?.status}`,
                          `Message: ${errorDetails?.message || error.message}`,
                          errorDetails?.trace ? `Stack trace: ${errorDetails.trace}` : '',
                          `Full response: ${JSON.stringify(errorDetails, null, 2)}`
                        ].filter(Boolean).join('\n') + '\n')
                      } else {
                        setSyncResult(prev => prev + `Unknown error: ${error}\n`)
                      }
                      console.error('Steam import error:', error)
                    }
                  }}
                  disabled={!user?.steamUser || isSyncing}
                >
                  Import First 5 Games
                </Button>
              </div>
              {syncResult && (
                <pre className="mt-4 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap overflow-auto max-h-[400px]">
                  {syncResult}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}