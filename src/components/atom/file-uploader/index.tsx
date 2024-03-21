import type { FileRouter, UploadthingComponentProps } from './types';
import type { UploadButtonProps } from './UploadButton';
import { UploadButton as Btn } from './UploadButton';
import type { UploadDropzoneProps } from './dropzone';
import { UploadDropzone as Zone } from './dropzone';
import { Uploader as Upldr } from './Uploader';
import { generateReactHelpers } from './useUploadThing';

export const generateUploadButton = <TRouter extends FileRouter>() => {
    const TypedButton = <TEndpoint extends keyof TRouter, TSkipPolling extends boolean = false>(
        props: UploadButtonProps<TRouter, TEndpoint, TSkipPolling>,
    ) => <Btn<TRouter, TEndpoint, TSkipPolling> {...(props as any)} />;
    return TypedButton;
};

export const generateUploadDropzone = <TRouter extends FileRouter>() => {
    const TypedDropzone = <TEndpoint extends keyof TRouter, TSkipPolling extends boolean = false>(
        props: UploadDropzoneProps<TRouter, TEndpoint, TSkipPolling>,
    ) => <Zone<TRouter, TEndpoint, TSkipPolling> {...(props as any)} />;
    return TypedDropzone;
};

export const generateUploader = <TRouter extends FileRouter>() => {
    const TypedUploader = <TEndpoint extends keyof TRouter, TSkipPolling extends boolean = false>(
        props: UploadthingComponentProps<TRouter, TEndpoint, TSkipPolling>,
    ) => <Upldr<TRouter, TEndpoint, TSkipPolling> {...(props as any)} />;
    return TypedUploader;
};

export function generateComponents<TRouter extends FileRouter>() {
    return {
        UploadButton: generateUploadButton<TRouter>(),
        UploadDropzone: generateUploadDropzone<TRouter>(),
        Uploader: generateUploader<TRouter>(),
    };
}

export { generateReactHelpers } from './useUploadThing';
export type * from './types';
export { useDropzone } from './dropzone';
export type * from './dropzone/types';
export { createUploadthing } from './create';

export const { UploadButton, UploadDropzone, Uploader } = generateComponents();
export const { useUploadThing, uploadFiles } = generateReactHelpers();
