import { CursorPagination } from './response-types';

/**
 * Pagination utilities for working with cursor-based pagination
 */
export class PaginationHelper {
    /**
     * Async generator to auto-paginate through all results
     * @param fetchPage - Function to fetch a page of results
     * @yields Individual items from each page
     * @example
     * ```typescript
     * const helper = new PaginationHelper();
     * for await (const thread of helper.paginateAll((cursor) => 
     *   client.threads.list({ cursor })
     * )) {
     *   console.log(thread);
     * }
     * ```
     */
    async *paginateAll<T>(
        fetchPage: (cursor?: string) => Promise<{
            threads?: T[];
            posts?: T[];
            users?: T[];
            tags?: T[];
            nextThreadCursor?: string;
            nextPostCursor?: string;
            nextUserCursor?: string;
            nextTagCursor?: string;
        }>
    ): AsyncIterableIterator<T> {
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
            const response = await fetchPage(cursor);

            // Determine which array and cursor to use
            const items = response.threads || response.posts || response.users || response.tags || [];
            const nextCursor = response.nextThreadCursor || response.nextPostCursor ||
                response.nextUserCursor || response.nextTagCursor;

            for (const item of items) {
                yield item;
            }

            cursor = nextCursor;
            hasMore = !!nextCursor;
        }
    }

    /**
     * Fetch all items from a paginated endpoint
     * @param fetchPage - Function to fetch a page of results
     * @param maxPages - Maximum number of pages to fetch (default: Infinity)
     * @returns Array of all items
     */
    async fetchAllPages<T>(
        fetchPage: (cursor?: string) => Promise<{
            threads?: T[];
            posts?: T[];
            users?: T[];
            tags?: T[];
            nextThreadCursor?: string;
            nextPostCursor?: string;
            nextUserCursor?: string;
            nextTagCursor?: string;
        }>,
        maxPages: number = Infinity
    ): Promise<T[]> {
        const allItems: T[] = [];
        let cursor: string | undefined;
        let pageCount = 0;

        while (pageCount < maxPages) {
            const response = await fetchPage(cursor);

            const items = response.threads || response.posts || response.users || response.tags || [];
            const nextCursor = response.nextThreadCursor || response.nextPostCursor ||
                response.nextUserCursor || response.nextTagCursor;

            allItems.push(...items);

            cursor = nextCursor;
            pageCount++;

            if (!nextCursor) break;
        }

        return allItems;
    }
}

/**
 * Input validation utilities
 */
export class Validator {
    /**
     * Validate that a string is not empty
     */
    static isNonEmptyString(value: any, fieldName: string): void {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${fieldName} must be a non-empty string`);
        }
    }

    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate that a value is one of the allowed options
     */
    static isOneOf<T>(value: T, options: T[], fieldName: string): void {
        if (!options.includes(value)) {
            throw new Error(`${fieldName} must be one of: ${options.join(', ')}`);
        }
    }

    /**
     * Validate cursor format (if needed)
     */
    static isValidCursor(cursor: string): boolean {
        return typeof cursor === 'string' && cursor.length > 0;
    }
}

/**
 * Retry utilities for handling transient failures
 */
export class RetryHelper {
    /**
     * Execute a function with exponential backoff retry
     * @param fn - Function to execute
     * @param maxRetries - Maximum number of retry attempts
     * @param initialDelay - Initial delay in milliseconds
     * @returns Result of the function
     */
    static async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        initialDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;

                // Don't retry on client errors (4xx) except 429
                if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
                    throw error;
                }

                // Don't retry on last attempt
                if (attempt === maxRetries) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = error.retryAfter
                    ? error.retryAfter * 1000
                    : initialDelay * Math.pow(2, attempt);

                await this.sleep(delay);
            }
        }

        throw lastError!;
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
