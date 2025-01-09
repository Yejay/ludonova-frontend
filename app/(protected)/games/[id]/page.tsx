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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { AxiosError } from 'axios';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

interface Game {
  id: number;
  title: string;
  description: string;
  backgroundImage: string;
  genres: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
}

interface Review {
  id: number;
  userId: number;
  username: string;
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

  // Fetch game details
  const { data: game, isLoading: isLoadingGame } = useQuery({
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
          // Game is not in library yet - this is normal
          return null;
        }
        // Only log actual errors
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
      
      // Wait for queries to be invalidated before proceeding
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['game-instance', id] }),
        queryClient.invalidateQueries({ queryKey: ['game-reviews', id] }),
        queryClient.invalidateQueries({ queryKey: ['game-instances'] }) // Invalidate library stats
      ]);

      // Force refetch the game instance
      await queryClient.fetchQuery({ queryKey: ['game-instance', id] });
    } catch (error) {
      console.error('Failed to add game to library:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        throw error; // Re-throw to handle in the UI
      }
    }
  };

  // Prevent the dropdown from closing when clicking menu items
  const handleDropdownSelect = async (status: GameStatus) => {
    try {
      await handleAddToLibrary(status);
    } catch (error) {
      // Show error to user
      console.error('Failed to update game status:', error);
    }
  };

  const handleStatusChange = async (newStatus: GameStatus) => {
    if (!gameInstance) return;
    try {
      console.log('Updating game status:', { gameId: id, status: newStatus });
      const response = await api.patch(`/game-instances/${gameInstance.id}/status?status=${newStatus}`);
      console.log('Successfully updated game status:', response.data);
      
      // Wait for queries to be invalidated
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['game-instance', id] }),
        queryClient.invalidateQueries({ queryKey: ['game-instances'] }) // Invalidate library stats
      ]);
    } catch (error) {
      console.error('Failed to update game status:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
      }
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
    return <div>Loading...</div>;
  }

  if (!game) {
    return <div>Game not found</div>;
  }

  // Check if the current user has already reviewed this game
  const userHasReviewed = reviews.length > 0 && reviews.some(review => 
    review.userId === user?.id
  );

  return (
    <div className="container py-6 space-y-6">
      <div className="relative aspect-[21/9] rounded-lg overflow-hidden">
        <Image
          src={game.backgroundImage}
          alt={game.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-bold mb-4">{game.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {game.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
            {gameInstance ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className={getStatusColor(gameInstance.status)}
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
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
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

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">About</h2>
            <div 
              className="text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: game.description }}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            <div className="space-y-4">
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
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
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
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              )}

              {isLoadingReviews ? (
                <div>Loading reviews...</div>
              ) : reviewsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Failed to load reviews</AlertDescription>
                </Alert>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{review.username}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarFilledIcon 
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-muted-foreground/20'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Release Date</h3>
            <p className="text-muted-foreground">
              {new Date(game.releaseDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Developer</h3>
            <p className="text-muted-foreground">{game.developer}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Publisher</h3>
            <p className="text-muted-foreground">{game.publisher}</p>
          </div>
          {gameInstance && (
            <>
              <div>
                <h3 className="font-medium mb-2">Play Time</h3>
                <p className="text-muted-foreground">
                  {gameInstance.playTime} minutes
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Last Played</h3>
                <p className="text-muted-foreground">
                  {gameInstance.lastPlayed
                    ? new Date(gameInstance.lastPlayed).toLocaleDateString()
                    : 'Never played'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
