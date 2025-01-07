import { Star } from 'lucide-react';
import type { Review } from '@/types/review';

interface RecentReviewsProps {
	reviews: Review[];
	isLoading: boolean;
}

export function RecentReviews({ reviews, isLoading }: RecentReviewsProps) {
	if (isLoading) {
		return (
			<div className='space-y-4'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='animate-pulse space-y-2'>
						<div className='h-4 w-3/4 bg-muted rounded' />
						<div className='flex gap-1'>
							{Array.from({ length: 5 }).map((_, j) => (
								<div key={j} className='w-4 h-4 bg-muted rounded' />
							))}
						</div>
						<div className='h-3 w-1/2 bg-muted rounded' />
					</div>
				))}
			</div>
		);
	}

	if (!reviews.length) {
		return (
			<div className='text-center py-8 text-muted-foreground'>
				<p>No reviews yet</p>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{reviews.map((review) => (
				<div key={review.id} className='space-y-2'>
					<h3 className='font-semibold line-clamp-1'>{review.game.title}</h3>
					<div className='flex gap-1'>
						{Array.from({ length: 5 }).map((_, i) => (
							<Star
								key={i}
								className={`w-4 h-4 ${
									i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
								}`}
							/>
						))}
					</div>
					<p className='text-sm text-muted-foreground line-clamp-2'>{review.content}</p>
					<p className='text-xs text-muted-foreground'>
						{new Date(review.createdAt).toLocaleDateString()}
					</p>
				</div>
			))}
		</div>
	);
} 