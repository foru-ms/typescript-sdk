import { AuthResource } from './resources/Auth';
import { ThreadsResource } from './resources/Threads';
import { PostsResource } from './resources/Posts';
import { UsersResource } from './resources/Users';
import { TagsResource } from './resources/Tags';
import { NotificationsResource } from './resources/Notifications';
import { SearchResource } from './resources/Search';
import { WebhooksResource } from './resources/Webhooks';
import { StatsResource } from './resources/Stats';
import { IntegrationsResource } from './resources/Integrations';
import { PrivateMessagesResource } from './resources/PrivateMessages';
import { ReportsResource } from './resources/Reports';
import { RolesResource } from './resources/Roles';
import { SSOResource } from './resources/SSO';
import {
    ForumAPIError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ServerError,
    NetworkError
} from './errors';
import { PaginationHelper, RetryHelper } from './utils';
import { RateLimitInfo } from './response-types';

// Polyfill fetch if needed (e.g. older Node versions)
const fetch = globalThis.fetch || require('cross-fetch');

export interface ClientOptions {
    /** API key for authentication */
    apiKey: string;
    /** Base URL for the API (default: https://api.foru.ms/v1) */
    baseUrl?: string;
    /** Maximum number of retry attempts for failed requests (default: 3) */
    maxRetries?: number;
    /** Enable automatic retry for rate limits and server errors (default: true) */
    enableRetry?: boolean;
}

/**
 * Main client for interacting with the Foru.ms API
 * @example
 * ```typescript
 * const client = new ForumClient({
 *   apiKey: 'your_api_key',
 *   baseUrl: 'https://api.foru.ms/v1'
 * });
 * 
 * // Set user token
 * client.setToken('user_jwt_token');
 * 
 * // Use resources
 * const threads = await client.threads.list();
 * ```
 */
export class ForumClient {
    public apiKey: string;
    public token: string | null = null;
    public baseUrl: string;
    public maxRetries: number;
    public enableRetry: boolean;

    /** Last known rate limit info */
    public lastRateLimitInfo?: RateLimitInfo;

    public auth: AuthResource;
    public threads: ThreadsResource;
    public posts: PostsResource;
    public users: UsersResource;
    public tags: TagsResource;
    public notifications: NotificationsResource;
    public search: SearchResource;
    public webhooks: WebhooksResource;
    public stats: StatsResource;
    public integrations: IntegrationsResource;
    public privateMessages: PrivateMessagesResource;
    public reports: ReportsResource;
    public roles: RolesResource;
    public sso: SSOResource;

    /** Pagination helper for auto-paginating through results */
    public pagination: PaginationHelper;

    constructor(options: ClientOptions) {
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://api.foru.ms/v1';
        this.maxRetries = options.maxRetries ?? 3;
        this.enableRetry = options.enableRetry ?? true;

        this.auth = new AuthResource(this);
        this.threads = new ThreadsResource(this);
        this.posts = new PostsResource(this);
        this.users = new UsersResource(this);
        this.tags = new TagsResource(this);
        this.notifications = new NotificationsResource(this);
        this.search = new SearchResource(this);
        this.webhooks = new WebhooksResource(this);
        this.stats = new StatsResource(this);
        this.integrations = new IntegrationsResource(this);
        this.privateMessages = new PrivateMessagesResource(this);
        this.reports = new ReportsResource(this);
        this.roles = new RolesResource(this);
        this.sso = new SSOResource(this);

        this.pagination = new PaginationHelper();
    }

    /**
     * Make an HTTP request to the API
     * @param path - API endpoint path
     * @param options - Fetch options
     * @returns Promise resolving to the response data
     * @throws {ForumAPIError} When the API returns an error
     * @throws {NetworkError} When the network request fails
     */
    public async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const makeRequest = async (): Promise<T> => {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                ...(options.headers as Record<string, string>),
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            let response: Response;

            try {
                response = await fetch(`${this.baseUrl}${path}`, {
                    ...options,
                    headers,
                });
            } catch (error: any) {
                throw new NetworkError('Network request failed', error);
            }

            // Extract rate limit info
            this.extractRateLimitInfo(response);

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                this.handleErrorResponse(response.status, data);
            }

            return data as T;
        };

        // Apply retry logic if enabled
        if (this.enableRetry) {
            return RetryHelper.withRetry(makeRequest, this.maxRetries);
        }

        return makeRequest();
    }

    /**
     * Set the authentication token for user-scoped requests
     * @param token - JWT token
     */
    public setToken(token: string): void {
        this.token = token;
    }

    /**
     * Clear the authentication token
     */
    public clearToken(): void {
        this.token = null;
    }

    /**
     * Check if client is authenticated
     */
    public isAuthenticated(): boolean {
        return this.token !== null;
    }

    /**
     * Extract and store rate limit information from response headers
     */
    private extractRateLimitInfo(response: Response): void {
        const limit = response.headers.get('x-ratelimit-limit');
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');

        if (limit && remaining && reset) {
            this.lastRateLimitInfo = {
                limit: parseInt(limit, 10),
                remaining: parseInt(remaining, 10),
                reset: parseInt(reset, 10),
            };
        }
    }

    /**
     * Handle error responses by throwing appropriate error types
     */
    private handleErrorResponse(status: number, data: any): never {
        const message = (data && data.message) || data.error || 'API Error';

        switch (status) {
            case 401:
                throw new AuthenticationError(message, data);
            case 403:
                throw new AuthorizationError(message, data);
            case 404:
                throw new NotFoundError(message, data);
            case 422:
                throw new ValidationError(message, data);
            case 429:
                const retryAfter = data.retryAfter || 60;
                throw new RateLimitError(message, retryAfter, data);
            case 500:
            case 502:
            case 503:
            case 504:
                throw new ServerError(message, status, data);
            default:
                throw new ForumAPIError(message, status, data);
        }
    }
}
