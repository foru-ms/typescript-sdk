import {
    ForumClient,
    ForumAPIError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ServerError,
    NetworkError
} from '@foru-ms/sdk';

/**
 * Example: Error Handling
 * Demonstrates proper error handling with custom error classes
 */

async function main() {
    const client = new ForumClient({
        apiKey: process.env.FORU_API_KEY || 'your_api_key',
        maxRetries: 3,
        enableRetry: true,
    });

    // Example 1: Catch specific error types
    console.log('=== Handling Specific Errors ===');
    try {
        await client.auth.login({
            login: 'nonexistent@example.com',
            password: 'wrong_password',
        });
    } catch (error) {
        if (error instanceof AuthenticationError) {
            console.log('Authentication failed');
            console.log('Message:', error.message);
            console.log('Status:', error.statusCode);
        } else if (error instanceof NetworkError) {
            console.log('Network error occurred');
            console.log('Cause:', error.cause);
        } else {
            console.log('Unexpected error:', error);
        }
    }

    // Example 2: Handle not found errors
    console.log('\n=== Handling Not Found ===');
    try {
        await client.threads.retrieve('non-existent-id');
    } catch (error) {
        if (error instanceof NotFoundError) {
            console.log('Thread not found');
            console.log('Status:', error.statusCode); // 404
        }
    }

    // Example 3: Handle validation errors
    console.log('\n=== Handling Validation Errors ===');
    try {
        await client.threads.create({
            title: '', // Invalid: empty title
            body: 'Test',
            userId: 'user-123',
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            console.log('Validation failed');
            console.log('Details:', error.response);
        }
    }

    // Example 4: Handle rate limits
    console.log('\n=== Handling Rate Limits ===');
    try {
        // Make many requests quickly
        for (let i = 0; i < 100; i++) {
            await client.threads.list();
        }
    } catch (error) {
        if (error instanceof RateLimitError) {
            console.log('Rate limit exceeded');
            console.log('Retry after:', error.retryAfter, 'seconds');
            console.log('Wait until:', new Date(Date.now() + error.retryAfter! * 1000));
        }
    }

    // Example 5: Handle server errors with retry
    console.log('\n=== Handling Server Errors ===');
    const clientWithoutRetry = new ForumClient({
        apiKey: process.env.FORU_API_KEY || 'your_api_key',
        enableRetry: false, // Disable auto-retry
    });

    try {
        // This might fail with 500 error
        await clientWithoutRetry.threads.list();
    } catch (error) {
        if (error instanceof ServerError) {
            console.log('Server error occurred');
            console.log('Status:', error.statusCode);
            console.log('You might want to retry manually');
        }
    }

    // Example 6: Generic error handling
    console.log('\n=== Generic Error Handling ===');
    try {
        await client.threads.delete('thread-123');
    } catch (error) {
        if (error instanceof ForumAPIError) {
            // All API errors inherit from ForumAPIError
            console.log('API Error:', error.message);
            console.log('Status Code:', error.statusCode);
            console.log('Response:', error.response);
        } else {
            // Non-API errors (network, etc.)
            console.log('Unexpected error:', error);
        }
    }

    // Example 7: Authorization errors
    console.log('\n=== Handling Authorization Errors ===');
    try {
        // Try to access admin-only endpoint
        await client.users.delete('some-user-id');
    } catch (error) {
        if (error instanceof AuthorizationError) {
            console.log('Permission denied');
            console.log('Status:', error.statusCode); // 403
        }
    }
}

main().catch(console.error);
