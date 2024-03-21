import React from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateUploadDropzone, createUploadthing } from '@/components/atom/file-uploader';
import type { FileRouter } from '@/components/atom/file-uploader';

const f = createUploadthing();

const fileRouter = {
    media: f({ image: { maxFileSize: '64MB', maxFileCount: 1 } }).onUploadComplete(() => {}),
} satisfies FileRouter;

type NewFileRouter = typeof fileRouter;

const UploadDropzone = generateUploadDropzone<NewFileRouter>();

type Props = {
    onChange: (url?: string) => void;
    value?: string;
};

const FileUploader: React.FC<Props> = ({ value, onChange }) => {
    const type = value?.split('.').pop();

    if (value) {
        return (
            <div className="tw-flex tw-flex-col tw-justify-center tw-items-center">
                {type !== 'pdf' ? (
                    <div className="tw-relative tw-w-40 tw-h-40">
                        <img src={convertFileSrc(value)} alt="uploaded img" />
                    </div>
                ) : (
                    <div className="tw-relative tw-flex tw-items-center tw-p-2 tw-mt-2 tw-rounded-md tw-bg-background/10">
                        <FileIcon />
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tw-ml-2 tw-text-sm tw-text-indigo-500 dark:tw-text-indigo-400 hover:tw-underline"
                        >
                            View PDF
                        </a>
                    </div>
                )}
                <Button variant="ghost" type="button" onClick={() => onChange('')}>
                    <X className="tw-w-4 tw-h-4" /> Remove File
                </Button>
            </div>
        );
    }

    return (
        <div className="tw-w-full tw-bg-muted/30">
            <UploadDropzone
                endpoint="media"
                onUploadComplete={res => onChange(res?.[0].url)}
                onUploadError={error => console.error(error)}
            />
        </div>
    );
};

export default FileUploader;
