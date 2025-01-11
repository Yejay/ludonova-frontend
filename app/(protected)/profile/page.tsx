'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, GamepadIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api/client';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { Progress } from '@/components/ui/progress';

interface SyncStats {
  totalGames: number;
  existingGames: number;
  newGames: number;
  failedGames: number;
  gameInstances: number;
}

interface SteamGame {
  name: string;
  appid: number;
  playtime_forever: number;
  rtime_last_played: number | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [syncStep, setSyncStep] = useState<number>(0);

  const handleSyncSteamLibrary = async () => {
    if (!user?.steamUser) return;
    
    setIsSyncing(true);
    setSyncProgress('');
    setSyncStats(null);
    setSyncStep(1);

    try {
      const startTime = Date.now();
      
      // Step 1: Get Steam library
      setSyncProgress('Fetching your Steam library...');
      const libraryResponse = await api.get('/steam/library');
      const games: SteamGame[] = libraryResponse.data.response.games;
      setSyncStep(2);
      
      // Step 2: Search for existing games
      setSyncProgress('Searching for existing games in our database...');
      const gameTitles = games.map(game => game.name);
      const existingGames = new Map<string, any>();
      const newGames: SteamGame[] = [];
      const failedGames: string[] = [];

      // Search for games in batches of 20
      const BATCH_SIZE = 20;
      for (let i = 0; i < gameTitles.length; i += BATCH_SIZE) {
        const batch = gameTitles.slice(i, i + BATCH_SIZE);
        for (const title of batch) {
          try {
            const searchResponse = await api.get('/games', {
              params: {
                query: title,
                page: 0,
                size: 1
              }
            });

            if (searchResponse.data.content.length > 0) {
              existingGames.set(title, searchResponse.data.content[0]);
            } else {
              const steamGame = games.find(g => g.name === title);
              if (steamGame) {
                newGames.push(steamGame);
              }
            }
          } catch (error) {
            failedGames.push(title);
          }
        }
        setSyncProgress(`Processing games... ${Math.min(100, Math.round((i + batch.length) / gameTitles.length * 100))}%`);
      }
      setSyncStep(3);

      // Step 3: Create new games
      if (newGames.length > 0) {
        setSyncProgress('Adding new games to our database...');
        for (let i = 0; i < newGames.length; i++) {
          const game = newGames[i];
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
                return null;
              }
              throw error;
            });

            if (!gameResponse) {
              failedGames.push(game.name);
              continue;
            }

            existingGames.set(game.name, gameResponse.data);
          } catch (error) {
            failedGames.push(game.name);
          }
          setSyncProgress(`Adding new games... ${Math.round((i + 1) / newGames.length * 100)}%`);
        }
      }
      setSyncStep(4);

      // Step 4: Create game instances
      setSyncProgress('Updating your game collection...');
      const gameInstances = [];
      for (const game of games) {
        const existingGame = existingGames.get(game.name);
        if (existingGame) {
          gameInstances.push({
            gameId: existingGame.id,
            status: 'PLAYING',
            playTime: game.playtime_forever,
            lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null
          });
        }
      }

      // Step 5: Send batch request
      if (gameInstances.length > 0) {
        const batchSize = 50;
        let successfulInstances = 0;
        for (let i = 0; i < gameInstances.length; i += batchSize) {
          const batch = gameInstances.slice(i, i + batchSize);
          try {
            const response = await api.post('/game-instances/batch', {
              gameInstances: batch
            });
            successfulInstances += response.data.length;
            setSyncProgress(`Updating collection... ${Math.round((i + batch.length) / gameInstances.length * 100)}%`);
          } catch (error) {
            // If it's a 400 error due to games already existing, we can ignore it
            // as this is expected behavior when re-syncing
            if (error instanceof AxiosError && error.response?.status === 400) {
              console.log('Some games already exist in library, skipping...');
              continue;
            }
            console.error('Error creating batch:', error);
          }
        }
      }
      setSyncStep(5);

      const duration = (Date.now() - startTime) / 1000;
      setSyncStats({
        totalGames: games.length,
        existingGames: existingGames.size,
        newGames: newGames.length,
        failedGames: failedGames.length,
        gameInstances: gameInstances.length,
      });

      toast({
        title: 'Success',
        description: `Steam library synced in ${duration.toFixed(1)} seconds`,
      });
    } catch (error) {
      console.error('Steam sync error:', error);
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || 'Failed to sync Steam library'
        : 'Failed to sync Steam library';
        
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center py-8 space-y-8">
      {/* Title Section */}
      <div className="flex flex-col items-center space-y-4 w-full px-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          {user?.steamUser?.personaName || user?.username}&apos;s Profile
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 w-full px-4">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={user?.steamUser?.avatarUrl} 
                  alt={user?.steamUser?.personaName || user?.username} 
                />
                <AvatarFallback className="text-2xl">
                  {(user?.steamUser?.personaName || user?.username)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Display Name:</span>
                <span className="font-medium text-foreground">
                  {user?.steamUser?.personaName || user?.username}
                </span>
              </div>
              {user?.steamUser && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <GamepadIcon className="h-4 w-4" />
                  <span>System Username:</span>
                  <span className="font-medium text-foreground">{user.username}</span>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email:</span>
                  <span className="font-medium text-foreground">{user.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Steam Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Steam Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user?.steamUser ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.steamUser.avatarUrl} alt={user.steamUser.personaName} />
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-medium text-lg">{user.steamUser.personaName}</p>
                    <a 
                      href={user.steamUser.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary inline-flex items-center"
                    >
                      <GamepadIcon className="h-4 w-4 mr-1" />
                      View Steam Profile
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Steam Library Sync</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep your game library up to date by syncing with your Steam account.
                    </p>
                  </div>

                  {isSyncing && (
                    <div className="space-y-4">
                      <Progress value={syncStep * 20} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">{syncProgress}</p>
                    </div>
                  )}

                  {syncStats && !isSyncing && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <p>✓ Total games processed: {syncStats.totalGames}</p>
                      <p>✓ Games already in database: {syncStats.existingGames}</p>
                      <p>✓ New games added: {syncStats.newGames}</p>
                      <p>✓ Games added to collection: {syncStats.gameInstances}</p>
                      {syncStats.failedGames > 0 && (
                        <p className="text-destructive">⚠ Failed to process: {syncStats.failedGames}</p>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleSyncSteamLibrary} 
                    disabled={isSyncing}
                    className="w-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Steam Library'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-4">
                <GamepadIcon className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">Steam Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Steam integration is only available for users who logged in through Steam.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 