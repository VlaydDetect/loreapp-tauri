// This file was generated by [ts-gen](https://github.com/VlaydDetect/ts-gen). Do not edit this file manually.
import type { DocumentType } from './DocumentType';

/**
 * Name must be unique
 */
export type Document = {
    id: string;
    ctime: string;
    type: DocumentType;
    title: string;
    body: string | null;
    tags: Array<string> | null;
    categories: Array<string> | null;
    used_pics: Array<string> | null;
};
