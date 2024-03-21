import { UploadThingError, defaultErrorFormatter } from './error';
import {
    type Json,
    type FileRouter,
    type FileRouterInputConfig,
    type AnyParams,
    type MiddlewareFnArgs,
    type UnsetMarker,
    type UploadBuilder,
    type UploadBuilderDef,
    type IUploader,
} from './types';

export { UploadThingError, type FileRouter };

function internalCreateBuilder<
    TMiddlewareArgs extends MiddlewareFnArgs<any, any, any>,
    TErrorShape extends Json = { message: string },
>(
    initDef: Partial<UploadBuilderDef<any>> = {},
): UploadBuilder<{
    _input: UnsetMarker;
    _metadata: UnsetMarker;
    _middlewareArgs: TMiddlewareArgs;
    _errorShape: TErrorShape;
    _errorFn: UnsetMarker;
    _output: UnsetMarker;
}> {
    const def: UploadBuilderDef<AnyParams> = {
        // Default router config
        routerConfig: {
            image: {
                maxFileSize: '4MB',
            },
        },

        inputParser: {
            parse: () => undefined,
            _input: undefined,
            _output: undefined,
        },

        middleware: () => ({}),
        onUploadError: () => ({}),

        errorFormatter: initDef.errorFormatter ?? defaultErrorFormatter,

        // Overload with properties passed in
        ...initDef,
    };

    return {
        input(userParser) {
            return internalCreateBuilder({
                ...def,
                inputParser: userParser,
            }) as UploadBuilder<any>;
        },
        middleware(userMiddleware) {
            return internalCreateBuilder({
                ...def,
                middleware: userMiddleware,
            }) as UploadBuilder<any>;
        },
        onUploadComplete(userUploadComplete) {
            return {
                _def: def,
                resolver: userUploadComplete,
            } as IUploader<any>;
        },
        onUploadError(userOnUploadError) {
            return internalCreateBuilder({
                ...def,
                onUploadError: userOnUploadError,
            }) as UploadBuilder<any>;
        },
    };
}

type InOut<
    TMiddlewareArgs extends MiddlewareFnArgs<any, any, any>,
    TErrorShape extends Json = { message: string },
> = (input: FileRouterInputConfig) => UploadBuilder<{
    _input: UnsetMarker;
    _metadata: UnsetMarker;
    _middlewareArgs: TMiddlewareArgs;
    _errorShape: TErrorShape;
    _errorFn: UnsetMarker;
    _output: UnsetMarker;
}>;

export type CreateBuilderOptions<TErrorShape extends Json> = {
    errorFormatter: (err: UploadThingError) => TErrorShape;
};

export function createBuilder<
    TMiddlewareArgs extends MiddlewareFnArgs<any, any, any>,
    TErrorShape extends Json = { message: string },
>(opts?: CreateBuilderOptions<TErrorShape>): InOut<TMiddlewareArgs, TErrorShape> {
    return (input: FileRouterInputConfig) => {
        return internalCreateBuilder<TMiddlewareArgs, TErrorShape>({
            routerConfig: input,
            ...opts,
        });
    };
}

type MiddlewareArgs = { req: Request; res: undefined; event: undefined };

export const createUploadthing = <TErrorShape extends Json>(
    opts?: CreateBuilderOptions<TErrorShape>,
) => createBuilder<MiddlewareArgs, TErrorShape>(opts);
