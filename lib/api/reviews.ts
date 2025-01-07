import { api } from './client';
import type { Review, ReviewCreateDTO, ReviewUpdateDTO } from '@/types/review';
import type { PageResponse } from '@/types/common';

interface FetchReviewsParams {
	page?: number;
	limit?: number;
	gameId?: number;
	userId?: number;
}

export async function fetchUserReviews({ page = 0, limit = 20, gameId }: FetchReviewsParams = {}): Promise<PageResponse<Review>> {
	try {
		const { data } = await api.get<PageResponse<Review>>('/reviews/user', {
			params: {
				page,
				size: limit,
				...(gameId ? { gameId } : {})
			},
		});
		return data;
	} catch (error) {
		throw error;
	}
}

export async function createReview(review: ReviewCreateDTO): Promise<Review> {
	try {
		const { data } = await api.post<Review>('/reviews', review);
		return data;
	} catch (error) {
		throw error;
	}
}

export async function updateReview(review: ReviewUpdateDTO): Promise<Review> {
	try {
		const { data } = await api.put<Review>(`/reviews/${review.id}`, review);
		return data;
	} catch (error) {
		throw error;
	}
}

export async function deleteReview(id: number): Promise<void> {
	try {
		await api.delete(`/reviews/${id}`);
	} catch (error) {
		throw error;
	}
} 