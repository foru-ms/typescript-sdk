/**
 * Base error class for all Foru.ms API errors
 */
export class ForumAPIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ForumAPIError';
        Object.setPrototypeOf(this, ForumAPIError.prototype);
    }
}

/**
 * Error thrown when authentication fails or token is invalid
 */
export class AuthenticationError extends ForumAPIError {
    constructor(message: string = 'Authentication failed', response?: any) {
        super(message, 401, response);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Error thrown when user doesn't have permission for an action
 */
export class AuthorizationError extends ForumAPIError {
    constructor(message: string = 'Permission denied', response?: any) {
        super(message, 403, response);
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends ForumAPIError {
    constructor(message: string = 'Resource not found', response?: any) {
        super(message, 404, response);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends ForumAPIError {
    constructor(message: string = 'Validation failed', response?: any) {
        super(message, 422, response);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends ForumAPIError {
    constructor(
        message: string = 'Rate limit exceeded',
        public retryAfter?: number,
        response?: any
    ) {
        super(message, 429, response);
        this.name = 'RateLimitError';
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Error thrown when server encounters an error
 */
export class ServerError extends ForumAPIError {
    constructor(message: string = 'Server error', statusCode: number = 500, response?: any) {
        super(message, statusCode, response);
        this.name = 'ServerError';
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends Error {
    constructor(message: string = 'Network request failed', public cause?: Error) {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
