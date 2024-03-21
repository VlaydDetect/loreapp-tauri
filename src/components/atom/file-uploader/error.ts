import type { Json } from './types';

const ERROR_CODES = {
    // Generic
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    INTERNAL_CLIENT_ERROR: 500,

    // S3 specific
    TOO_LARGE: 413,
    TOO_SMALL: 400,
    TOO_MANY_FILES: 400,
    KEY_TOO_LONG: 400,

    // UploadThing specific
    URL_GENERATION_FAILED: 500,
    UPLOAD_FAILED: 500,
    MISSING_ENV: 500,
    FILE_LIMIT_EXCEEDED: 500,
} as const;

type ErrorCode = keyof typeof ERROR_CODES;
type UploadThingErrorOptions<T> = {
    code: keyof typeof ERROR_CODES;
    message?: string;
    cause?: unknown;
    data?: T;
};

function messageFromUnknown(cause: unknown, fallback?: string) {
    if (typeof cause === 'string') {
        return cause;
    }
    if (cause instanceof Error) {
        return cause.message;
    }
    if (
        cause &&
        typeof cause === 'object' &&
        'message' in cause &&
        typeof cause.message === 'string'
    ) {
        return cause.message;
    }
    return fallback ?? 'An unknown error occurred';
}

export class UploadThingError<TShape extends Json = { message: string }> extends Error {
    public readonly cause?: unknown;

    public readonly code: ErrorCode;

    public readonly data?: TShape;

    constructor(initOpts: UploadThingErrorOptions<TShape> | string) {
        const opts: UploadThingErrorOptions<TShape> =
            typeof initOpts === 'string'
                ? { code: 'INTERNAL_SERVER_ERROR', message: initOpts }
                : initOpts;
        const message = opts.message ?? messageFromUnknown(opts.cause, opts.code);

        super(message);
        this.code = opts.code;
        this.data = opts.data;

        if (opts.cause instanceof Error) {
            this.cause = opts.cause;
        } else if (opts.cause instanceof Response) {
            this.cause = new Error(`Response ${opts.cause.status} ${opts.cause.statusText}`);
        } else if (typeof opts.cause === 'string') {
            this.cause = new Error(opts.cause);
        } else {
            this.cause = opts.cause;
        }
    }
}

export const fatalClientError = (e: Error) =>
    new UploadThingError({
        code: 'INTERNAL_CLIENT_ERROR',
        message: 'Something went wrong. Please report this to UploadThing.',
        cause: e,
    });

export function defaultErrorFormatter(error: UploadThingError) {
    return {
        message: error.message,
    };
}
