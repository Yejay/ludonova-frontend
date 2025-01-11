'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { GameStatus, type GameInstance } from '@/types/game';
import { getStatusColor, getStatusDisplayName } from '@/utils/game-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { use } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { AxiosError } from 'axios';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Calendar, Gamepad } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Game {
  id: number;
  title: string;
  description: string;
  backgroundImage: string;
  genres: string[];
  releaseDate: string;
}

interface Review {
  id: number;
  userId: number;
  username: string;
  steamPersonaName: string | null;
  reviewText: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewCreateDTO {
  gameId: number;
  reviewText: string;
  rating: number;
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch game details
  const { data: game, isLoading: isLoadingGame, error: gameError } = useQuery({
    queryKey: ['game', id],
    queryFn: async () => {
      const response = await api.get<Game>(`/games/${id}`);
      return response.data;
    }
  });

  // Fetch game instance if it exists in user's library
  const { data: gameInstance, isLoading: isLoadingInstance } = useQuery({
    queryKey: ['game-instance', id],
    queryFn: async () => {
      try {
        console.log('Fetching game instance for game:', id);
        const response = await api.get<GameInstance>(`/game-instances/by-game/${id}`);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        console.error('Error fetching game instance:', error);
        return null;
      }
    }
  });

  // Fetch reviews with error handling
  const { 
    data: reviews = [], 
    isLoading: isLoadingReviews,
    error: reviewsError
  } = useQuery({
    queryKey: ['game-reviews', id],
    queryFn: async () => {
      try {
        const response = await api.get<Review[]>(`/reviews/game/${id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return [];
      }
    }
  });

  const handleAddToLibrary = async (status: GameStatus) => {
    try {
      console.log('Adding game to library:', { gameId: id, status });
      const response = await api.post('/game-instances', {
        gameId: Number(id),
        status
      });
      console.log('Successfully added game to library, response:', response.data);
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['game-instance', id] }),
        queryClient.invalidateQueries({ queryKey: ['game-reviews', id] }),
        queryClient.invalidateQueries({ queryKey: ['game-instances'] })
      ]);

      await queryClient.fetchQuery({ queryKey: ['game-instance', id] });
    } catch (error) {
      console.error('Failed to add game to library:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        throw error;
      }
    }
  };

  const handleDropdownSelect = async (status: GameStatus) => {
    try {
      await handleAddToLibrary(status);
    } catch (error) {
      console.error('Failed to update game status:', error);
    }
  };

  const handleStatusChange = async (status: GameStatus) => {
    if (!gameInstance) return;

    try {
      await api.patch(`/game-instances/${gameInstance.id}/status`, null, {
        params: { status }
      });
      await queryClient.invalidateQueries({ queryKey: ['game-instance', id] });
      await queryClient.invalidateQueries({ queryKey: ['game-instances'] });
      await queryClient.invalidateQueries({ queryKey: ['library-stats'] });
    } catch (error) {
      console.error('Failed to update game status:', error);
    }
  };

  const handleDelete = async () => {
    if (!gameInstance) return;

    try {
      await api.delete(`/game-instances/${gameInstance.id}`);
      await queryClient.invalidateQueries({ queryKey: ['game-instances'] });
      await queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      router.push('/games');
    } catch (error) {
      console.error('Failed to delete game from library:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      setReviewError('Review cannot be empty');
      return;
    }

    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    setReviewError(null);
    setIsSubmitting(true);

    try {
      const reviewData: ReviewCreateDTO = {
        gameId: Number(id),
        reviewText: reviewContent.trim(),
        rating
      };
      
      await api.post('/reviews', reviewData);
      setReviewContent('');
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ['game-reviews', id] });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to submit review';
      setReviewError(errorMessage);
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="text-yellow-500 hover:scale-110 transition-transform"
          >
            {star <= rating ? (
              <StarFilledIcon className="h-6 w-6" />
            ) : (
              <StarIcon className="h-6 w-6" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isLoadingGame || isLoadingInstance) {
    return (
      <div className="container py-6 space-y-6">
        <div className="relative aspect-[21/9] rounded-lg overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Game not found</h1>
      </div>
    );
  }

  const userHasReviewed = reviews.length > 0 && reviews.some(review => 
    review.userId === user?.id
  );

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${minutes} minutes`;
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src={game.backgroundImage}
          alt={game.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-8 py-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {game.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="backdrop-blur-sm bg-background/50">
                    {genre}
                  </Badge>
                ))}
              </div>
              {gameInstance ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className={cn("backdrop-blur-sm bg-background/50", getStatusColor(gameInstance.status))}
                    >
                      {getStatusDisplayName(gameInstance.status)}
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.values(GameStatus).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                      >
                        {getStatusDisplayName(status)}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      onClick={handleDelete}
                    >
                      Remove from Library
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="backdrop-blur-sm bg-background/50">
                      Add to Library
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.values(GameStatus).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleDropdownSelect(status)}
                      >
                        {getStatusDisplayName(status)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="space-y-8">
          {/* About and Game Details */}
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: game.description }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Release Date</p>
                    <p className="text-sm">{new Date(game.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {gameInstance && (
                  <>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Play Time</p>
                        <p className="text-sm">{formatPlayTime(gameInstance.playTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Gamepad className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Last Played</p>
                        <p className="text-sm">
                          {gameInstance.lastPlayed
                            ? new Date(gameInstance.lastPlayed).toLocaleDateString()
                            : 'Never played'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!gameInstance ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Add this game to your library to write a review
                  </AlertDescription>
                </Alert>
              ) : userHasReviewed ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have already reviewed this game
                  </AlertDescription>
                </Alert>
              ) : (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <StarRating />
                    </div>
                    <Textarea
                      placeholder="Write your review..."
                      value={reviewContent}
                      onChange={(e) => {
                        setReviewContent(e.target.value);
                        setReviewError(null);
                      }}
                    />
                    {reviewError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{reviewError}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isLoadingReviews ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : reviewsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Failed to load reviews</AlertDescription>
                </Alert>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{review.username.startsWith('steam_') && review.steamPersonaName ? review.steamPersonaName : review.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarFilledIcon 
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating ? "text-yellow-500" : "text-muted-foreground/20"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.reviewText}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
