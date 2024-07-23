//! Last tailwind-merge commit (https://github.com/dcastil/tailwind-merge/commit/361cf8c63c83993691571b078950461db883ca3a)
//! Last clsx commit (https://github.com/lukeed/clsx/commit/684509c3860a71e9e301b8c33f67e98ad5990c62)

export { createTailwindMerge } from './lib/create-tailwind-merge'
export { getDefaultConfig } from './lib/default-config'
export { extendTailwindMerge } from './lib/extend-tailwind-merge'
export { fromTheme } from './lib/from-theme'
export { mergeConfigs } from './lib/merge-configs'
export { twJoin, type ClassNameValue } from './lib/tw-join'
export { twMerge } from './lib/tw-merge'
export {
    type ClassValidator,
    type Config,
    type DefaultClassGroupIds,
    type DefaultThemeGroupIds,
} from './lib/types'
export * as validators from './lib/validators'
