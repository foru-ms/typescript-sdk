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

// Polyfill fetch if needed (e.g. older Node versions)
const fetch = globalThis.fetch || require('cross-fetch');

export class ForumClient {
    public apiKey: string;
    public token: string | null = null;
    public baseUrl: string;

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

    constructor(options: { apiKey: string; baseUrl?: string }) {
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://api.foru.ms/v1';

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
    }

    public async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers,
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error((data && (data as any).message) || (data as any).error || 'API Error');
        }

        return data as T;
    }

    public setToken(token: string) {
        this.token = token;
    }
}
