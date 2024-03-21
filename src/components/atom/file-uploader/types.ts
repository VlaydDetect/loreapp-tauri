import type { CSSProperties, ReactNode } from 'react';
import { UploadThingError } from './error';
import { JsonParser } from './parser';
import { MimeType } from './mime-type';

export type ErrorMessage<TError extends string> = TError;

export type ExpandedRouteConfig = Partial<{
    [key in FileRouterInputKey]: RouteConfig;
}>;

export type EndpointMetadata = {
    slug: string;
    config: ExpandedRouteConfig;
}[];

/**
 * A subset of the standard Response properties needed by UploadThing internally.
 * @see Response from lib.dom.d.ts
 */
export interface ResponseEsque {
    status: number;
    ok: boolean;
    /**
     * @remarks
     * The built-in Response::json() method returns Promise<any>, but
     * that's not as type-safe as unknown. We use unknown because we're
     * more type-safe. You do want more type safety, right? 😉
     */
    json: <T = unknown>() => Promise<T>;
    text: () => Promise<string>;
    blob: () => Promise<Blob>;

    headers: Headers;

    clone: () => ResponseEsque;
}

export type StyleField<T extends object> =
    | string
    | CSSProperties
    | ((args: T) => string | CSSProperties);

export type ContentField<T extends object> = ReactNode | ((args: T) => ReactNode);

export type MaybePromise<TType> = TType | Promise<TType>;

export type ExtendObjectIf<Predicate, ToAdd> = undefined extends Predicate
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : ToAdd;

/**
 * `.middleware()` can add a customId to the incoming file data
 */
export interface FileUploadDataWithCustomId extends FileUploadData {
    /**
     * As set by `.middleware()` using @link {UTFiles}
     */
    customId: string | null;
}

/**
 * When files are uploaded, we get back a key and a URL for the file
 */
export interface UploadedFileData extends FileUploadDataWithCustomId {
    key: string;
    url: string;
}

/**
 * When the client has uploaded a file and polled for data returned by `.onUploadComplete()`
 */
export interface ClientUploadedFileData<T> extends UploadedFileData {
    /**
     * Matches what's returned from the serverside `onUploadComplete` callback
     */
    serverData: T;
}

/**
 * Properties from the web File object, this is what the client sends when initiating an upload
 */
export interface FileUploadData {
    name: string;
    size: number;
    type: string;
}

/**
 * Map actionType to the required payload for that action
 */
export type UTEvents = {
    upload: {
        in: {
            files: FileUploadData[];
            input: Json;
        };
        out: PresignedURLs;
    };
    failure: {
        in: {
            fileKey: string;
            uploadId: string | null;
            s3Error?: string;
            fileName: string;
        };
        out: null;
    };
    'multipart-complete': {
        in: {
            fileKey: string;
            uploadId: string;
            etags: {
                tag: string;
                partNumber: number;
            }[];
        };
        out: null;
    };
};

export type InferEndpointInput<TUploader extends IUploader<any>> =
    TUploader['_def']['_input'] extends UnsetMarker ? undefined : TUploader['_def']['_input'];

export type InferEndpointOutput<TUploader extends IUploader<any>> =
    TUploader['_def']['_output'] extends UnsetMarker | void | undefined
        ? null
        : TUploader['_def']['_output'];

export type InferErrorShape<TRouter extends FileRouter> =
    TRouter[keyof TRouter]['_def']['_errorShape'];

export type UploadFilesOptions<
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
> = {
    /**
     * The files to upload
     */
    files: File[];
    /**
     * Called when presigned URLs have been retrieved and the file upload is about to begin
     */
    onUploadBegin?: (opts: { file: string }) => void;
    /**
     * Called continuously as the file is uploaded to the storage provider
     */
    onUploadProgress?: (opts: { file: string; progress: number }) => void;
    /**
     * Skip polling for server data after upload is complete
     * Useful if you want faster response times and don't need
     * any data returned from the server `onUploadComplete` callback
     * @default false
     */
    skipPolling?: TSkipPolling;
    /**
     * URL to the UploadThing API endpoint
     * @remarks This option is not required when `uploadFiles` has been generated with `genUploader`
     */
    url: URL;
} & ExtendObjectIf<
    InferEndpointInput<TRouter[TEndpoint]>,
    { input: InferEndpointInput<TRouter[TEndpoint]> }
>;

export const ALLOWED_FILE_TYPES = ['image', 'video', 'audio', 'pdf', 'text', 'blob'] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export type FileRouterInputKey = AllowedFileType | MimeType;

export type ContentDisposition = 'inline' | 'attachment';

export interface PresignedBase {
    key: string;
    fileName: string;
    fileType: FileRouterInputKey;
    fileUrl: string;
    contentDisposition: ContentDisposition;
    pollingJwt: string;
    pollingUrl: string;
    customId: string | null;
}

export interface PSPResponse extends PresignedBase {
    url: string;
    fields: Record<string, string>;
}

/**
 * Returned by `/api/prepareUpload` and `/api/uploadFiles`
 */
export type PresignedURLs = PSPResponse[];

/**
 * Marker used to append a `customId` to the incoming file data in `.middleware()`
 */
export const UTFiles = Symbol('uploadthing-custom-id-symbol');

const unsetMarker = 'unsetMarker' as 'unsetMarker' & {
    __brand: 'unsetMarker';
};
export type UnsetMarker = typeof unsetMarker;

export type ValidMiddlewareObject = {
    [UTFiles]?: Partial<FileUploadDataWithCustomId>[];
    [key: string]: unknown;
};

export type Simplify<TType> = { [TKey in keyof TType]: TType[TKey] } & {};

type ResolverOptions<TParams extends AnyParams> = {
    metadata: Simplify<
        TParams['_metadata'] extends UnsetMarker
            ? undefined
            : Omit<TParams['_metadata'], typeof UTFiles>
    >;

    file: UploadedFileData;
};

/**
 * Different frameworks have different request and response types
 */
export type MiddlewareFnArgs<TRequest, TResponse, TEvent> = {
    req: TRequest;
    res: TResponse;
    event: TEvent;
};

export interface AnyParams {
    _input: any;
    _metadata: any; // imaginary field used to bind metadata return type to an Upload resolver
    _middlewareArgs: MiddlewareFnArgs<any, any, any>;
    _errorShape: any;
    _errorFn: any; // used for onUploadError
    _output: any;
}

export type JsonValue = string | number | boolean | null | undefined;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue | JsonObject | JsonArray };
export type Json = JsonValue | JsonObject | JsonArray;

type MiddlewareFn<
    TInput extends Json | UnsetMarker,
    TOutput extends ValidMiddlewareObject,
    TArgs extends MiddlewareFnArgs<any, any, any>,
> = (
    opts: TArgs & {
        files: FileUploadData[];
        input: TInput extends UnsetMarker ? undefined : TInput;
    },
) => MaybePromise<TOutput>;

type ResolverFn<TOutput extends Json | void, TParams extends AnyParams> = (
    opts: ResolverOptions<TParams>,
) => MaybePromise<TOutput>;

type UploadErrorFn = (input: { error: UploadThingError; fileKey: string }) => void;

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
export type SizeUnit = 'B' | 'KB' | 'MB' | 'GB';
export type FileSize = `${PowOf2}${SizeUnit}`;

export type ACL = 'public-read' | 'private';
type RouteConfig = {
    maxFileSize: FileSize;
    maxFileCount: number;
    contentDisposition: ContentDisposition;
    acl?: ACL; // default is set on UT server, not backfilled like other options
};

type PartialRouteConfig = Partial<Record<FileRouterInputKey, Partial<RouteConfig>>>;

export type FileRouterInputConfig = FileRouterInputKey[] | PartialRouteConfig;

export interface UploadBuilder<TParams extends AnyParams> {
    input: <TParser extends JsonParser>(
        parser: TParams['_input'] extends UnsetMarker
            ? TParser
            : ErrorMessage<'input is already set'>,
    ) => UploadBuilder<{
        _input: TParser['_output'];
        _metadata: TParams['_metadata'];
        _middlewareArgs: TParams['_middlewareArgs'];
        _errorShape: TParams['_errorShape'];
        _errorFn: TParams['_errorFn'];
        _output: UnsetMarker;
    }>;
    middleware: <TOutput extends ValidMiddlewareObject>(
        fn: TParams['_metadata'] extends UnsetMarker
            ? MiddlewareFn<TParams['_input'], TOutput, TParams['_middlewareArgs']>
            : ErrorMessage<'middleware is already set'>,
    ) => UploadBuilder<{
        _input: TParams['_input'];
        _metadata: TOutput;
        _middlewareArgs: TParams['_middlewareArgs'];
        _errorShape: TParams['_errorShape'];
        _errorFn: TParams['_errorFn'];
        _output: UnsetMarker;
    }>;
    onUploadComplete: <TOutput extends Json | void>(
        fn: ResolverFn<TOutput, TParams>,
    ) => IUploader<{
        _input: TParams['_input'];
        _metadata: TParams['_metadata'];
        _middlewareArgs: TParams['_middlewareArgs'];
        _errorShape: TParams['_errorShape'];
        _errorFn: TParams['_errorFn'];
        _output: TOutput;
    }>;
    onUploadError: (
        fn: TParams['_errorFn'] extends UnsetMarker
            ? UploadErrorFn
            : ErrorMessage<'onUploadError is already set'>,
    ) => UploadBuilder<{
        _input: TParams['_input'];
        _metadata: TParams['_metadata'];
        _middlewareArgs: TParams['_middlewareArgs'];
        _errorShape: TParams['_errorShape'];
        _errorFn: UploadErrorFn;
        _output: UnsetMarker;
    }>;
}

export type UploadBuilderDef<TParams extends AnyParams> = {
    routerConfig: FileRouterInputConfig;
    inputParser: JsonParser;
    // eslint-disable-next-line @typescript-eslint/ban-types
    middleware: MiddlewareFn<TParams['_input'], {}, TParams['_middlewareArgs']>;
    errorFormatter: (err: UploadThingError) => TParams['_errorShape'];
    onUploadError: UploadErrorFn;
};

export interface IUploader<TParams extends AnyParams> {
    _def: TParams & UploadBuilderDef<TParams>;
    resolver: ResolverFn<TParams['_output'], TParams>;
}

export type FileRouter<TParams extends AnyParams = AnyParams> = Record<string, IUploader<TParams>>;

export type UseUploadthingProps<
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
    TServerOutput = false extends TSkipPolling ? InferEndpointOutput<TRouter[TEndpoint]> : null,
> = {
    /**
     * Called when the upload is submitted and the server is about to be queried for presigned URLs
     * Can be used to modify the files before they are uploaded, e.g. renaming them
     */
    onBeforeUploadBegin?: (files: File[]) => Promise<File[]> | File[];
    /**
     * Called when presigned URLs have been retrieved and the file upload is about to begin
     */
    onUploadBegin?: (fileName: string) => void;
    /**
     * Called continuously as the file is uploaded to the storage provider
     */
    onUploadProgress?: (p: number) => void;
    /**
     * Skip polling for server data after upload is complete
     * Useful if you want faster response times and don't need
     * any data returned from the server `onUploadComplete` callback
     * @default false
     */
    skipPolling?: TSkipPolling;
    /**
     * Called when the file uploads are completed
     * - If `skipPolling` is `true`, this will be called once
     *   all the files are uploaded to the storage provider.
     * - If `skipPolling` is `false`, this will be called after
     *   the serverside `onUploadComplete` callback has finished
     */
    onUploadComplete?: (res: ClientUploadedFileData<TServerOutput>[]) => void;
    /**
     * Called if the upload fails
     */
    onUploadError?: (e: UploadThingError<InferErrorShape<TRouter>>) => void;
    /**
     * Set custom headers that'll get sent with requests
     * to your server
     */
    headers?: HeadersInit | (() => MaybePromise<HeadersInit>);
};

export type UploadthingComponentProps<
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
> = UseUploadthingProps<TRouter, TEndpoint, TSkipPolling> & {
    /**
     * The endpoint from your FileRouter to use for the upload
     */
    endpoint: TEndpoint;
    /**
     * URL to the UploadThing API endpoint
     * @example URL { /api/uploadthing }
     * @example URL { https://www.example.com/api/uploadthing }
     *
     * If relative, host will be inferred from either the `VERCEL_URL` environment variable or `window.location.origin`
     *
     * @default (VERCEL_URL ?? window.location.origin) + "/api/uploadthing"
     */
    url?: string | URL;
    config?: {
        mode?: 'auto' | 'manual';
        appendOnPaste?: boolean;
    };
} & ExtendObjectIf<
        InferEndpointInput<TRouter[TEndpoint]>,
        {
            /**
             * The input to the endpoint, as defined using `.input()` on the FileRouter endpoint
             * @see https://docs.uploadthing.com/api-reference/server#input
             */
            input: InferEndpointInput<TRouter[TEndpoint]>;
        }
    >;
