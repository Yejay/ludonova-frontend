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

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncSteamLibrary = async () => {
    if (!user?.steamUser) return;
    
    setIsSyncing(true);
    try {
      await api.post('/game-instances/sync-steam');
      toast({
        title: 'Success',
        description: 'Your Steam library has been synced successfully.',
      });
    } catch (error: unknown) {
      console.error('Failed to sync Steam library:', error instanceof AxiosError ? error.response?.data : error);
      toast({
        title: 'Error',
        description: 'Failed to sync Steam library. Please try again later.',
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

                <div className="space-y-2">
                  <h4 className="font-medium">Steam Library Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep your game library up to date by syncing with your Steam account.
                  </p>
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