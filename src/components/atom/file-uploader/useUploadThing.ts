import { useRef, useState } from 'react';
import { UploadThingError, fatalClientError } from './error';
import type {
    ClientUploadedFileData,
    FileRouter,
    InferEndpointInput,
    InferEndpointOutput,
    InferErrorShape,
    PresignedURLs,
    UploadFilesOptions,
    UseUploadthingProps,
} from './types';
import useEvent from './useEvent';
import { picFmc } from '@/db';

const uploadFilesInternal = async <
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
    TServerOutput = false extends TSkipPolling ? InferEndpointOutput<TRouter[TEndpoint]> : null,
>(
    opts: UploadFilesOptions<TRouter, TEndpoint, TSkipPolling>,
): Promise<ClientUploadedFileData<TServerOutput>[]> => {
    const backendRes: PresignedURLs = await reportEventToUT('upload', {
        input: 'input' in opts ? opts.input : null,
        files: opts.files.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
        })),
    });

    const fileUploadPromises = backendRes.map(async presigned => {
        const file = opts.files.find(f => f.name === presigned.fileName);

        if (!file) {
            console.error('No file found for presigned URL', presigned);
            throw new UploadThingError({
                code: 'NOT_FOUND',
                message: 'No file found for presigned URL',
                cause: `Expected file with name ${
                    presigned.fileName
                } but got '${opts.files.join(',')}'`,
            });
        }

        // TODO: upload file here
        picFmc.create();
        await uploadPresignedPost(file, presigned, { reportEventToUT, ...opts });

        let serverData: InferEndpointOutput<TRouter[TEndpoint]> | null = null;
        if (!opts.skipPolling) {
            serverData = await withExponentialBackoff(async () => {
                type PollingResponse =
                    | {
                          status: 'done';
                          callbackData: InferEndpointOutput<TRouter[TEndpoint]>;
                      }
                    | { status: 'still waiting' };

                const res = await fetch(presigned.pollingUrl, {
                    headers: { authorization: presigned.pollingJwt },
                }).then(r => r.json() as Promise<PollingResponse>);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return res.status === 'done' ? res.callbackData : undefined;
            });
        }

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            key: presigned.key,
            url: `https://utfs.io/f/${presigned.key}`,
            serverData: serverData as any,
            customId: presigned.customId,
        };
    });

    return Promise.all(fileUploadPromises);
};

export const genUploader = <TRouter extends FileRouter>(url: string) => {
    return <TEndpoint extends keyof TRouter, TSkipPolling extends boolean = false>(
        opts: Omit<UploadFilesOptions<TRouter, TEndpoint, TSkipPolling>, 'url'>,
    ) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        uploadFilesInternal<TRouter, TEndpoint, TSkipPolling>({
            ...opts,
            url,
        } as any);
};

export const uploadthingHookGen = <TRouter extends FileRouter>(url: string) => {
    const uploadFiles = genUploader<TRouter>(url);

    const useUploadThing = <TEndpoint extends keyof TRouter, TSkipPolling extends boolean = false>(
        endpoint: TEndpoint,
        opts?: UseUploadthingProps<TRouter, TEndpoint, TSkipPolling>,
    ) => {
        const [isUploading, setUploading] = useState(false);
        const uploadProgress = useRef(0);
        const fileProgress = useRef<Map<string, number>>(new Map());

        type InferredInput = InferEndpointInput<TRouter[typeof endpoint]>;
        type FuncInput = undefined extends InferredInput
            ? [files: File[], input?: undefined]
            : [files: File[], input: InferredInput];

        const startUpload = useEvent(async (...args: FuncInput) => {
            const files = (await opts?.onBeforeUploadBegin?.(args[0])) ?? args[0];
            const input = args[1];

            setUploading(true);
            opts?.onUploadProgress?.(0);
            try {
                const res = await uploadFiles({
                    files,
                    skipPolling: opts?.skipPolling,
                    onUploadProgress: progress => {
                        if (!opts?.onUploadProgress) return;
                        fileProgress.current.set(progress.file, progress.progress);
                        let sum = 0;
                        fileProgress.current.forEach(p => {
                            sum += p;
                        });
                        const averageProgress =
                            Math.floor(sum / fileProgress.current.size / 10) * 10;
                        if (averageProgress !== uploadProgress.current) {
                            opts?.onUploadProgress?.(averageProgress);
                            uploadProgress.current = averageProgress;
                        }
                    },
                    onUploadBegin({ file }) {
                        if (!opts?.onUploadBegin) return;

                        opts.onUploadBegin(file);
                    },
                    // @ts-expect-error - input may not be defined on the type
                    input,
                });

                opts?.onUploadComplete?.(res);
                return res;
            } catch (e) {
                let error: UploadThingError<InferErrorShape<TRouter>>;
                if (e instanceof UploadThingError) {
                    error = e as UploadThingError<InferErrorShape<TRouter>>;
                } else {
                    error = fatalClientError(e as Error);
                    console.error(
                        'Something went wrong. Please contact UploadThing and provide the following cause:',
                        error.cause instanceof Error ? error.cause.toString() : error.cause,
                    );
                }
                opts?.onUploadError?.(error);
            } finally {
                setUploading(false);
                fileProgress.current = new Map();
                uploadProgress.current = 0;
            }
        });

        return {
            startUpload,
            isUploading,
        } as const;
    };

    return useUploadThing;
};

export const generateReactHelpers = <TRouter extends FileRouter>(url: string) => {
    return {
        useUploadThing: uploadthingHookGen<TRouter>(url),
        uploadFiles: genUploader<TRouter>(url),
    } as const;
};
