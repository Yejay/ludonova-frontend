'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api/client'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'

interface SteamGame {
  name: string
  appid: number
  playtime_forever: number
  rtime_last_played: number | null
}

export default function DebugPage() {
  const { user } = useAuth()
  const [syncResult, setSyncResult] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [gameCount, setGameCount] = useState<number | null>(null)
  const [isRefreshingCount, setIsRefreshingCount] = useState(false)

  const fetchGameCount = async () => {
    setIsRefreshingCount(true)
    try {
      const response = await api.get('/games/count')
      setGameCount(response.data)
    } catch (error) {
      console.error('Failed to fetch game count:', error)
    } finally {
      setIsRefreshingCount(false)
    }
  }

  useEffect(() => {
    fetchGameCount()
  }, [])

  const testSteamSync = async () => {
    setIsSyncing(true)
    setSyncResult('Starting Steam sync...\n')
    try {
      const startTime = Date.now()
      
      // Step 1: Get Steam library
      setSyncResult(prev => prev + 'Fetching Steam library...\n')
      const libraryResponse = await api.get('/steam/library')
      const games: SteamGame[] = libraryResponse.data.response.games
      setSyncResult(prev => prev + `Found ${games.length} games in Steam library\n\n`)

      // Step 2: Prepare game titles for bulk search
      setSyncResult(prev => prev + 'Searching for existing games...\n')
      const gameTitles = games.map(game => game.name)
      const existingGames = new Map<string, any>()
      const newGames: SteamGame[] = []
      const failedGames: string[] = []

      // Search for games in batches of 20
      const BATCH_SIZE = 20
      for (let i = 0; i < gameTitles.length; i += BATCH_SIZE) {
        const batch = gameTitles.slice(i, i + BATCH_SIZE)
        for (const title of batch) {
          try {
            const searchResponse = await api.get('/games', {
              params: {
                query: title,
                page: 0,
                size: 1
              }
            })

            if (searchResponse.data.content.length > 0) {
              existingGames.set(title, searchResponse.data.content[0])
              setSyncResult(prev => prev + `Found existing game: ${title}\n`)
            } else {
              const steamGame = games.find(g => g.name === title)
              if (steamGame) {
                newGames.push(steamGame)
                setSyncResult(prev => prev + `Will create new game: ${title}\n`)
              }
            }
          } catch (error) {
            failedGames.push(title)
            setSyncResult(prev => prev + `Failed to search for game ${title}: ${error}\n`)
          }
        }
      }

      setSyncResult(prev => prev + `\nFound ${existingGames.size} existing games\n`)
      setSyncResult(prev => prev + `Will create ${newGames.length} new games\n`)
      if (failedGames.length > 0) {
        setSyncResult(prev => prev + `Failed to process ${failedGames.length} games\n\n`)
      }

      // Step 3: Create new games in batches
      if (newGames.length > 0) {
        setSyncResult(prev => prev + 'Creating new games...\n')
        for (const game of newGames) {
          try {
            const gameResponse = await api.post('/games', {
              title: game.name,
              apiId: game.appid.toString(),
              source: 'STEAM',
              platform: 'PC',
              slug: game.name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim(),
              backgroundImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
              genres: ['Steam Game']
            }).catch(error => {
              if (error.response?.status === 500) {
                setSyncResult(prev => prev + `Failed to create game ${game.name}: ${error.response?.data?.message || error.message}\n`);
                return null;
              }
              throw error;
            });

            if (!gameResponse) {
              failedGames.push(game.name);
              continue;
            }

            existingGames.set(game.name, gameResponse.data);
            setSyncResult(prev => prev + `Created game: ${game.name}\n`);
          } catch (error) {
            failedGames.push(game.name)
            setSyncResult(prev => prev + `Failed to create game ${game.name}: ${error}\n`)
          }
        }
      }

      // Step 4: Create game instances
      const gameInstances = []
      for (const game of games) {
        const existingGame = existingGames.get(game.name)
        if (existingGame) {
          gameInstances.push({
            gameId: existingGame.id,
            status: 'PLAYING',
            playTime: game.playtime_forever,
            lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null
          })
        }
      }

      // Step 5: Send batch request
      if (gameInstances.length > 0) {
        setSyncResult(prev => prev + `\nCreating ${gameInstances.length} game instances...\n`)
        const batchSize = 50 // Process in smaller batches to avoid timeouts
        for (let i = 0; i < gameInstances.length; i += batchSize) {
          const batch = gameInstances.slice(i, i + batchSize)
          try {
            const response = await api.post('/game-instances/batch', {
              gameInstances: batch
            })
            setSyncResult(prev => 
              prev + `Successfully created batch of ${response.data.length} game instances\n`)
          } catch (error) {
            if (error instanceof AxiosError) {
              const errorDetails = error.response?.data
              setSyncResult(prev => prev + [
                `Error creating batch ${i / batchSize + 1}:`,
                `Status: ${error.response?.status}`,
                `Message: ${errorDetails?.message || error.message}`,
                errorDetails?.trace ? `Stack trace: ${errorDetails.trace}` : '',
                `Full response: ${JSON.stringify(errorDetails, null, 2)}`
              ].filter(Boolean).join('\n') + '\n')
            } else {
              setSyncResult(prev => prev + `Unknown error in batch ${i / batchSize + 1}: ${error}\n`)
            }
          }
        }
      }
      
      const duration = (Date.now() - startTime) / 1000
      setSyncResult(prev => prev + `\nSteam sync completed in ${duration} seconds\n`)
      setSyncResult(prev => prev + [
        `Total games processed: ${games.length}`,
        `Existing games found: ${existingGames.size}`,
        `New games created: ${newGames.length}`,
        `Failed games: ${failedGames.length}`,
        `Game instances created: ${gameInstances.length}`
      ].join('\n') + '\n')

    } catch (error) {
      if (error instanceof AxiosError) {
        const errorDetails = error.response?.data
        setSyncResult(prev => prev + [
          'Error during sync:',
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
            <CardTitle>Database Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium">Games in Database</h3>
                  <p className="text-sm text-muted-foreground">
                    {gameCount !== null ? gameCount : 'Loading...'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchGameCount}
                  disabled={isRefreshingCount}
                >
                  {isRefreshingCount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Count'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  onClick={testSteamSync}
                  disabled={!user?.steamUser || isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Steam Library'
                  )}
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