'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { User } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SteamIcon } from '@/components/icons/steam';

export function UserProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await api.get<User>('/user/current');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <Card>
          <CardHeader className="space-y-1">
            <div className="h-7 w-24 bg-muted rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
            <div className="h-9 w-full bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSteamConnect = async () => {
    try {
      const response = await api.get<{ authUrl: string }>('/auth/steam/url');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get Steam auth URL:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl md:text-2xl">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-medium truncate">
              {user.username}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground break-all">
              {user.email}
            </p>
          </div>
          
          <div className="flex-none">
            {user.steamUser ? (
              <Button 
                variant="outline" 
                className="w-full sm:w-auto h-9 text-xs md:text-sm" 
                disabled
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SteamIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {user.steamUser.personaName || 'Connected to Steam'}
                  </span>
                </div>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full sm:w-auto h-9 text-xs md:text-sm" 
                onClick={handleSteamConnect}
              >
                <div className="flex items-center gap-2">
                  <SteamIcon className="h-4 w-4 shrink-0" />
                  <span>Connect Steam</span>
                </div>
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs md:text-sm text-muted-foreground pt-2 border-t">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
} 