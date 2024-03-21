import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/utils';
import { useDropzone } from './useDropzone';
import {
    allowedContentTextLabelGenerator,
    contentFieldToContent,
    generateDropzoneAccept,
    generatePermittedFileTypes,
    styleFieldToClassName,
    styleFieldToCssObject,
    getFilesFromClipboardEvent,
    progressWidths,
    Spinner,
} from '../shared';
import type {
    ContentField,
    ErrorMessage,
    StyleField,
    FileRouter,
    UploadthingComponentProps,
} from '../types';
import { uploadthingHookGen } from '../useUploadThing';

type DropzoneStyleFieldCallbackArgs = {
    __runtime: 'react';
    ready: boolean;
    isUploading: boolean;
    uploadProgress: number;
    fileTypes: string[];
    isDragActive: boolean;
};

type DropzoneAppearance = {
    container?: StyleField<DropzoneStyleFieldCallbackArgs>;
    uploadIcon?: StyleField<DropzoneStyleFieldCallbackArgs>;
    label?: StyleField<DropzoneStyleFieldCallbackArgs>;
    allowedContent?: StyleField<DropzoneStyleFieldCallbackArgs>;
    button?: StyleField<DropzoneStyleFieldCallbackArgs>;
};

type DropzoneContent = {
    uploadIcon?: ContentField<DropzoneStyleFieldCallbackArgs>;
    label?: ContentField<DropzoneStyleFieldCallbackArgs>;
    allowedContent?: ContentField<DropzoneStyleFieldCallbackArgs>;
    button?: ContentField<DropzoneStyleFieldCallbackArgs>;
};

type Props<
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
> = UploadthingComponentProps<TRouter, TEndpoint, TSkipPolling> & {
    /**
     * @see https://docs.uploadthing.com/theming#style-using-the-classname-prop
     */
    className?: string;
    /**
     * @see https://docs.uploadthing.com/theming#style-using-the-appearance-prop
     */
    appearance?: DropzoneAppearance;
    /**
     * @see https://docs.uploadthing.com/theming#content-customisation
     */
    content?: DropzoneContent;
};

function UploadDropzone<
    TRouter extends FileRouter,
    TEndpoint extends keyof TRouter,
    TSkipPolling extends boolean = false,
>(
    props: FileRouter extends TRouter
        ? ErrorMessage<'You forgot to pass the generic'>
        : Props<TRouter, TEndpoint, TSkipPolling>,
) {
    // Cast back to UploadthingComponentProps<TRouter> to get the correct type
    // since the ErrorMessage messes it up otherwise
    const $props = props as unknown as Props<TRouter, TEndpoint, TSkipPolling> & {
        // props not exposed on public type
        // Allow to set internal state for testing
        __internal_state?: 'readying' | 'ready' | 'uploading';
        // Allow to set upload progress for testing
        __internal_upload_progress?: number;
        // Allow to set ready explicitly and independently of internal state
        __internal_ready?: boolean;
        // Allow to show the button even if no files were added
        __internal_show_button?: boolean;
        // Allow to disable the button
        __internal_button_disabled?: boolean;
        // Allow to disable the dropzone
        __internal_dropzone_disabled?: boolean;
    };
    const { mode = 'manual', appendOnPaste = false } = $props.config ?? {};

    const useUploadThing = uploadthingHookGen<TRouter>();

    const [files, setFiles] = useState<File[]>([]);

    const [uploadProgressState, setUploadProgress] = useState(
        $props.__internal_upload_progress ?? 0,
    );
    const uploadProgress = $props.__internal_upload_progress ?? uploadProgressState;
    const { startUpload, isUploading, permittedFileInfo } = useUploadThing($props.endpoint, {
        headers: $props.headers,
        skipPolling: !$props?.onUploadComplete ? true : $props?.skipPolling,
        onUploadComplete: res => {
            setFiles([]);
            $props.onUploadComplete?.(res);
            setUploadProgress(0);
        },
        onUploadProgress: p => {
            setUploadProgress(p);
            $props.onUploadProgress?.(p);
        },
        onUploadError: $props.onUploadError,
        onUploadBegin: $props.onUploadBegin,
        onBeforeUploadBegin: $props.onBeforeUploadBegin,
    });

    const { fileTypes, multiple } = generatePermittedFileTypes(permittedFileInfo?.config);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setFiles(acceptedFiles);

            // If mode is auto, start upload immediately
            if (mode === 'auto') {
                const input = 'input' in $props ? $props.input : undefined;
                startUpload(acceptedFiles, input);
            }
        },
        [$props, mode, startUpload],
    );

    const { getRootProps, getInputProps, isDragActive, rootRef } = useDropzone({
        onDrop,
        multiple,
        accept: fileTypes ? generateDropzoneAccept(fileTypes) : undefined,
        disabled: $props.__internal_dropzone_disabled,
    });

    const ready =
        $props.__internal_ready ?? ($props.__internal_state === 'ready' || fileTypes.length > 0);

    const onUploadClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!files) return;

        const input = 'input' in $props ? $props.input : undefined;
        startUpload(files, input);
    };

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            if (!appendOnPaste) return;
            if (document.activeElement !== rootRef.current) return;

            const pastedFiles = getFilesFromClipboardEvent(event);
            if (!pastedFiles?.length) return;

            let filesToUpload = pastedFiles;
            setFiles(prev => {
                filesToUpload = [...prev, ...pastedFiles];
                return filesToUpload;
            });

            if (mode === 'auto') {
                const input = 'input' in $props ? $props.input : undefined;
                startUpload(filesToUpload, input);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [startUpload, $props, appendOnPaste, mode, fileTypes, rootRef, files]);

    const getUploadButtonText = (types: string[]) => {
        if (files.length > 0) return `Upload ${files.length} file${files.length === 1 ? '' : 's'}`;
        if (types.length === 0) return 'Loading...';
        return `Choose File${multiple ? `(s)` : ``}`;
    };

    const state = (() => {
        if ($props.__internal_state) return $props.__internal_state;
        if (!ready) return 'readying';
        if (ready && !isUploading) return 'ready';

        return 'uploading';
    })();

    const getUploadButtonContents = (types: string[]) => {
        if (state !== 'uploading') {
            return getUploadButtonText(types);
        }
        if (uploadProgress === 100) {
            return <Spinner />;
        }
        return <span className="tw-z-50">{uploadProgress}%</span>;
    };

    const styleFieldArg = {
        fileTypes,
        isDragActive,
        isUploading,
        ready,
        uploadProgress,
    } as DropzoneStyleFieldCallbackArgs;

    return (
        <div
            className={cn(
                'tw-mt-2 tw-flex tw-flex-col tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-dashed tw-border-gray-900/25 tw-px-6 tw-py-10 tw-text-center',
                isDragActive && 'tw-bg-blue-600/10',
                $props.className,
                styleFieldToClassName($props.appearance?.container, styleFieldArg),
            )}
            {...getRootProps()}
            style={styleFieldToCssObject($props.appearance?.container, styleFieldArg)}
            data-state={state}
        >
            {contentFieldToContent($props.content?.uploadIcon, styleFieldArg) ?? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className={cn(
                        'tw-mx-auto tw-block tw-h-12 tw-w-12 tw-align-middle tw-text-gray-400',
                        styleFieldToClassName($props.appearance?.uploadIcon, styleFieldArg),
                    )}
                    style={styleFieldToCssObject($props.appearance?.uploadIcon, styleFieldArg)}
                    data-ut-element="upload-icon"
                    data-state={state}
                >
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765a4.5 4.5 0 0 1 8.302-3.046a3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            )}
            <label
                htmlFor="file-upload"
                className={cn(
                    'tw-relative tw-mt-4 tw-flex tw-w-64 tw-cursor-pointer tw-items-center tw-justify-center tw-text-sm tw-font-semibold tw-leading-6 tw-text-gray-600 focus-within:tw-outline-none focus-within:tw-ring-2 focus-within:tw-ring-blue-600 focus-within:tw-ring-offset-2 hover:tw-text-blue-500',
                    ready ? 'tw-text-blue-600' : 'tw-text-gray-500',
                    styleFieldToClassName($props.appearance?.label, styleFieldArg),
                )}
                style={styleFieldToCssObject($props.appearance?.label, styleFieldArg)}
                data-ut-element="label"
                data-state={state}
            >
                {contentFieldToContent($props.content?.label, styleFieldArg) ??
                    (ready ? `Choose files or drag and drop` : `Loading...`)}
                <input className="tw-sr-only" {...getInputProps()} />
            </label>
            <div
                className={cn(
                    'tw-m-0 tw-h-[1.25rem] tw-text-xs tw-leading-5 tw-text-gray-600',
                    styleFieldToClassName($props.appearance?.allowedContent, styleFieldArg),
                )}
                style={styleFieldToCssObject($props.appearance?.allowedContent, styleFieldArg)}
                data-ut-element="allowed-content"
                data-state={state}
            >
                {contentFieldToContent($props.content?.allowedContent, styleFieldArg) ??
                    allowedContentTextLabelGenerator(permittedFileInfo?.config)}
            </div>

            <button
                className={cn(
                    'tw-relative tw-mt-4 tw-flex tw-h-10 tw-w-36 tw-cursor-pointer tw-items-center tw-justify-center tw-overflow-hidden tw-rounded-md tw-border-none tw-text-base tw-text-white after:tw-transition-[width] after:tw-duration-500 focus-within:tw-ring-2 focus-within:tw-ring-blue-600 focus-within:tw-ring-offset-2',
                    state === 'readying' && 'tw-cursor-not-allowed tw-bg-blue-400',
                    state === 'uploading' &&
                        `tw-bg-blue-400 after:tw-absolute after:tw-left-0 after:tw-h-full after:tw-bg-blue-600 after:tw-content-[''] ${progressWidths[uploadProgress]}`,
                    state === 'ready' && 'tw-bg-blue-600',
                    'disabled:tw-pointer-events-none',
                    styleFieldToClassName($props.appearance?.button, styleFieldArg),
                )}
                style={styleFieldToCssObject($props.appearance?.button, styleFieldArg)}
                onClick={onUploadClick}
                data-ut-element="button"
                data-state={state}
                disabled={
                    $props.__internal_button_disabled ?? (!files.length || state === 'uploading')
                }
            >
                {contentFieldToContent($props.content?.button, styleFieldArg) ??
                    getUploadButtonContents(fileTypes)}
            </button>
        </div>
    );
}

export { UploadDropzone };
export type { Props as UploadDropzoneProps };
