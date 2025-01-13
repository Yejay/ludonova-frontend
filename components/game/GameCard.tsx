import Image from 'next/image';
import Link from 'next/link';
import { GameStatus } from '@/types/game';
import { getStatusColor, getStatusDisplayName } from '@/utils/game-status';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, PlusIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface BaseGameCardProps {
  gameId: number;
  title: string;
  backgroundImage: string;
  genres: string[];
  className?: string;
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
  onDelete: (gameId: number) => Promise<void>;
}

interface BrowseGameCardProps extends BaseGameCardProps {
  variant: 'browse';
  onAddToLibrary: (gameId: number) => void;
}

type GameCardProps = LibraryGameCardProps | BrowseGameCardProps;

export function GameCard(props: GameCardProps) {
  const { gameId, title, backgroundImage, genres, className } = props;

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <Card className={cn(
      "overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-300",
      "active:ring-2 active:ring-primary/50",
      className
    )}>
      <Link href={`/games/${gameId}`}>
        <div className="relative aspect-[16/9]">
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {props.variant === 'library' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "absolute bottom-2 left-2",
                    "h-7 md:h-8",
                    "text-xs md:text-sm",
                    "min-h-[28px] md:min-h-[32px] min-w-[28px] md:min-w-[32px]",
                    getStatusColor(props.instance.status)
                  )}
                >
                  <span className="hidden xs:inline">{getStatusDisplayName(props.instance.status)}</span>
                  <span className="xs:hidden">{getStatusDisplayName(props.instance.status).slice(0, 1)}</span>
                  <ChevronDownIcon className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.values(GameStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    className="min-h-[36px] md:min-h-[40px] text-xs md:text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      props.onStatusChange(props.instance.id, status);
                    }}
                  >
                    {getStatusDisplayName(status)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 min-h-[36px] md:min-h-[40px] text-xs md:text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onDelete(props.instance.id);
                  }}
                >
                  Remove from Library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 left-2 h-7 md:h-8 min-h-[28px] md:min-h-[32px] text-xs md:text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.onAddToLibrary(gameId);
              }}
            >
              <PlusIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Add to Library</span>
              <span className="xs:hidden">Add</span>
            </Button>
          )}
        </div>
      </Link>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{title}</h3>
        <div className="flex flex-wrap gap-1 mt-1.5 md:mt-2">
          {genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2">
              {genre}
            </Badge>
          ))}
          {genres.length > 2 && (
            <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2">
              +{genres.length - 2}
            </Badge>
          )}
        </div>
        {props.variant === 'library' && (
          <>
            <div className="flex items-center justify-between mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              {props.instance.lastPlayed ? (
                <span>Last: {new Date(props.instance.lastPlayed).toLocaleDateString()}</span>
              ) : (
                <span>Not played</span>
              )}
              {props.instance.playTime > 0 && (
                <span>{formatPlayTime(props.instance.playTime)}</span>
              )}
            </div>
            {props.instance.progressPercentage > 0 && (
              <div className="mt-1.5 md:mt-2 h-1 md:h-1.5 bg-muted rounded-full overflow-hidden">
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