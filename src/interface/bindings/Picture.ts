// This file was generated by [ts-gen](https://github.com/VlaydDetect/ts-gen). Do not edit this file manually.
import type { Category } from "./Category";
import type { Tag } from "./Tag";

export type Picture = { id: string, ctime: string, path: string, name: string | null, desc: string | null, tags: Array<Tag> | null, categories: Array<Category> | null, };