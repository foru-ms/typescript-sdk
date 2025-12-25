# SDK Examples

This directory contains example code demonstrating common use cases for the Foru.ms SDK.

## Examples

- [Authentication](./authentication.ts) - Login, registration, and token management
- [Managing Threads](./managing-threads.ts) - Create, update, and interact with threads
- [Pagination](./pagination.ts) - Working with cursor-based pagination
- [Webhooks](./webhooks.ts) - Setting up and verifying webhooks
- [Error Handling](./error-handling.ts) - Properly handling SDK errors

## Running Examples

```bash
# Install dependencies
npm install @foru-ms/sdk

# Run an example with ts-node
npx ts-node examples/authentication.ts

# Or compile and run
tsc examples/authentication.ts && node examples/authentication.js
```

## Configuration

Most examples require an API key. Set it as an environment variable:

```bash
export FORU_API_KEY="your_api_key_here"
```

For user-authenticated examples, you'll also need a user token:

```bash
export FORU_USER_TOKEN="user_jwt_token"
```
