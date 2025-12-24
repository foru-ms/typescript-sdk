import { ForumClient } from '../Client';
import { StatsResponse } from '../types';

export class StatsResource {
    private client: ForumClient;

    constructor(client: ForumClient) {
        this.client = client;
    }

    async get(params?: {
        filter?: 'newest' | 'oldest';
        threadCursor?: string;
        postCursor?: string;
        userCursor?: string;
        reportCursor?: string;
    }): Promise<StatsResponse> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value as string);
                }
            });
        }

        return this.client.request<StatsResponse>(`/stats?${searchParams.toString()}`, {
            method: 'GET',
        });
    }
}
