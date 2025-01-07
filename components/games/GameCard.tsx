import Image from 'next/image';
import { Game } from '@/types/game';
import { StarIcon } from '@heroicons/react/20/solid';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const releaseYear = new Date(game.releaseDate).getFullYear();

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="aspect-[16/9] relative">
        <Image
          src={game.backgroundImage}
          alt={game.title}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-game.jpg';
          }}
        />
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg truncate">{game.title}</h3>
        
        <div className="flex items-center space-x-1">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span>{game.rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {game.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {releaseYear}
        </div>
      </div>
    </div>
  );
} 