import { ForumClient } from '../Client';
import { Webhook, WebhookListResponse } from '../types';

export class WebhooksResource {
    private client: ForumClient;

    constructor(client: ForumClient) {
        this.client = client;
    }

    async list(): Promise<WebhookListResponse> {
        return this.client.request<WebhookListResponse>('/webhooks', {
            method: 'GET',
        });
    }

    async create(payload: {
        name: string;
        url: string;
        events: string[];
    }): Promise<{ webhook: Webhook }> {
        return this.client.request<{ webhook: Webhook }>('/webhooks', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async retrieve(id: string): Promise<{ webhook: Webhook }> {
        return this.client.request<{ webhook: Webhook }>(`/webhooks/${id}`, {
            method: 'GET',
        });
    }

    async update(id: string, payload: {
        name?: string;
        url?: string;
        events?: string[];
        active?: boolean;
    }): Promise<{ webhook: Webhook }> {
        return this.client.request<{ webhook: Webhook }>(`/webhooks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    async delete(id: string): Promise<{ success: boolean }> {
        return this.client.request<{ success: boolean }>(`/webhooks/${id}`, {
            method: 'DELETE',
        });
    }

    async getDeliveries(id: string, params?: { cursor?: string }): Promise<{ deliveries: any[]; total: number; nextCursor?: string }> {
        const searchParams = new URLSearchParams();
        if (params?.cursor) searchParams.append('cursor', params.cursor);

        return this.client.request<{ deliveries: any[]; total: number; nextCursor?: string }>(`/webhooks/${id}/deliveries?${searchParams.toString()}`, {
            method: 'GET',
        });
    }
}
