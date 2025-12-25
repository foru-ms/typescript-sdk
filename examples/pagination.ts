import { ForumClient } from '@foru-ms/sdk';

/**
 * Example: Working with Pagination
 * Demonstrates different ways to paginate through results
 */

async function main() {
    const client = new ForumClient({
        apiKey: process.env.FORU_API_KEY || 'your_api_key',
    });

    // Example 1: Manual Pagination
    console.log('=== Manual Pagination ===');
    let cursor: string | undefined;
    let pageCount = 0;
    const maxPages = 3;

    do {
        const response = await client.threads.list({ cursor, filter: 'newest' });
        console.log(`Page ${++pageCount}:`, response.threads.length, 'threads');

        // Process threads
        response.threads.forEach(thread => {
            console.log(`  - ${thread.title}`);
        });

        cursor = response.nextThreadCursor;
    } while (cursor && pageCount < maxPages);

    // Example 2: Auto-pagination with async iterator
    console.log('\n=== Auto-Pagination (Async Iterator) ===');
    let count = 0;
    const maxItems = 10;

    for await (const thread of client.pagination.paginateAll(
        (cursor) => client.threads.list({ cursor, filter: 'newest' })
    )) {
        console.log(`Thread ${++count}:`, thread.title);

        if (count >= maxItems) break; // Limit for demo
    }

    // Example 3: Fetch all pages at once
    console.log('\n=== Fetch All Pages ===');
    const allThreads = await client.pagination.fetchAllPages(
        (cursor) => client.threads.list({ cursor }),
        3 // Max 3 pages
    );
    console.log('Total threads fetched:', allThreads.length);

    // Example 4: Paginate with filters
    console.log('\n=== Pagination with Filters ===');
    cursor = undefined;
    pageCount = 0;

    do {
        const response = await client.posts.list({
            cursor,
            filter: 'newest',
            type: 'created', // Only posts created by user
            userId: 'user-123',
        });

        console.log(`Page ${++pageCount}:`, response.posts.length, 'posts');
        cursor = response.nextPostCursor;
    } while (cursor && pageCount < 2);

    // Example 5: Check rate limits during pagination
    console.log('\n=== Rate Limit Monitoring ===');
    await client.threads.list();

    if (client.lastRateLimitInfo) {
        console.log('Rate Limit Info:');
        console.log('  Limit:', client.lastRateLimitInfo.limit);
        console.log('  Remaining:', client.lastRateLimitInfo.remaining);
        console.log('  Resets at:', new Date(client.lastRateLimitInfo.reset * 1000));
    }
}

main().catch(console.error);
