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
    return <div>Loading profile...</div>;
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
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{user.username}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          
          {user.steamId ? (
            <Button variant="outline" className="gap-2" disabled>
              <SteamIcon className="h-4 w-4" />
              Connected to Steam
            </Button>
          ) : (
            <Button variant="outline" className="gap-2" onClick={handleSteamConnect}>
              <SteamIcon className="h-4 w-4" />
              Connect Steam
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
} 