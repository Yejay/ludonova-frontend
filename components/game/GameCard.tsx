import Image from 'next/image';
import Link from 'next/link';
import { GameInstance, GameStatus } from '@/types/game';
import { getStatusColor, getStatusDisplayName } from '@/utils/game-status';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';

interface BaseGameCardProps {
  gameId: number;
  title: string;
  backgroundImage: string;
  genres: string[];
}

interface LibraryGameCardProps extends BaseGameCardProps {
  variant: 'library';
  instance: {
    id: number;
    status: GameStatus;
    lastPlayed: string | null;
    playTime: number;
    progressPercentage: number;
  };
  onStatusChange: (gameId: number, status: GameStatus) => Promise<void>;
}

interface BrowseGameCardProps extends BaseGameCardProps {
  variant: 'browse';
  onAddToLibrary: (gameId: number) => void;
}

type GameCardProps = LibraryGameCardProps | BrowseGameCardProps;

export function GameCard(props: GameCardProps) {
  const { gameId, title, backgroundImage, genres } = props;

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
      <Link href={`/games/${gameId}`}>
        <div className="relative aspect-[16/9]">
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {props.variant === 'library' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={`absolute bottom-2 left-2 ${getStatusColor(props.instance.status)}`}
                >
                  {getStatusDisplayName(props.instance.status)}
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.values(GameStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
                      props.onStatusChange(props.instance.id, status);
                    }}
                  >
                    {getStatusDisplayName(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 left-2"
              onClick={(e) => {
                e.preventDefault();
                props.onAddToLibrary(gameId);
              }}
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Add to Library
            </Button>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{title}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {genres.map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
        {props.variant === 'library' && (
          <>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              {props.instance.lastPlayed ? (
                <span>Last played: {new Date(props.instance.lastPlayed).toLocaleDateString()}</span>
              ) : (
                <span>Not played yet</span>
              )}
              {props.instance.playTime > 0 && (
                <span>{formatPlayTime(props.instance.playTime)}</span>
              )}
            </div>
            {props.instance.progressPercentage > 0 && (
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${props.instance.progressPercentage}%` }}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 