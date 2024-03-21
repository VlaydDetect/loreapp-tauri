import {cva, VariantProps} from "class-variance-authority";
import clsx from "clsx";
import { twMerge } from 'tailwind-merge'
import {forwardRef, useRef} from "react";
import {AriaButtonProps, mergeProps, useButton, useFocusRing, useHover} from "react-aria";
import {mergeRefs} from "@/utils/utils"

const variants = cva(
    [
        'tw-rounded-full', 'tw-tracking-wide', 'tw-cursor-pointer', 'tw-inline-flex',
        'tw-items-center', 'tw-justify-center', 'tw-relative', 'tw-transition',
        'tw-outline-none', 'data-[pressed=true]:tw-scale-[0.98]', 'disabled:tw-cursor-not-allowed'
    ],
    {
        variants: {
            variant: {
                primary: [
                    'tw-bg-indigo-500', 'tw-text-white', 'tw-font-semibold', 'shadow',
                    'data-[hovered=true]:tw-bg-indigo-600', 'data-[hovered=true]:tw-shadow-md', 'data-[focus-visible=true]:tw-ring-indigo-500/70', 'data-[focus-visible=true]:tw-ring-offset-2',
                    'data-[focus-visible=true]:tw-ring-2', 'disabled:!tw-bg-indigo-500/50', 'disabled:!tw-shadow'
                ],
                secondary: [
                    'tw-font-normal', 'tw-bg-gray-50', 'data-[hovered=true]:tw-bg-gray-100', 'disabled:!tw-bg-gray-50',
                    'tw-text-gray-950', 'tw-shadow', 'data-[hovered=true]:tw-shadow-md', 'tw-border',
                    'tw-border-neutral-200/50', 'data-[focus-visible=true]:tw-ring-offset-2', 'data-[focus-visible=true]:tw-ring-2',
                    'data-[focus-visible=true]:tw-ring-gray-200',
                ],
                destructive: [
                    'tw-font-semibold', 'tw-bg-red-500', 'tw-text-white', 'tw-rounded-full',
                    'tw-shadow', 'data-[hovered=true]:tw-shadow-md', 'disabled:!tw-bg-red-500/50 disabled:!tw-shadow', 'data-[focus-visible=true]:tw-ring-offset-2',
                    'data-[focus-visible=true]:tw-ring-2', 'data-[focus-visible=true]:tw-ring-red-200'
                ],
                ghost: [
                    'tw-font-light', 'tw-text-gray-950', 'data-[hovered=true]:tw-text-gray-600', 'disabled:!tw-text-gray-950',
                    'data-[focus-visible=true]:tw-ring-gray-300', 'data-[focus-visible=true]:tw-ring-1'
                ],
                link: [
                    'tw-font-light', 'data-[hovered=true]:tw-text-indigo-600', 'disabled:!tw-text-indigo-500/50', 'disabled:!tw-no-underline'
                ],
            },
            size: {
                small: ['tw-text-sm', 'tw-py-1', 'tw-px-4'],
                default: ['tw-py-2', 'tw-px-8', 'tw-leading-6'],
                large: ['tw-text-lg', 'tw-py-3', 'tw-px-12'],
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default'
        }
    }
)

const Loading = () => (
    <div className="tw-absolute tw-inline-flex tw-items-center">
        <div className="tw-w-4 tw-h-4 tw-rounded-full tw-border-2 tw-border-b-transparent tw-animate-spin tw-border-[inherit]"/>
    </div>
)

type ButtonProps = AriaButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof variants> & {
    loading: boolean
}

/**
 * use OnPress instead onPressed
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, forwardedRef) => {
    const {className, variant, size, children, loading, disabled} = props
    const ref = useRef<HTMLButtonElement>(null);
    const {buttonProps, isPressed} = useButton({
        ...props,
        isDisabled: disabled || loading
    }, ref)
    const {hoverProps, isHovered} = useHover(props)
    const {focusProps, isFocusVisible} = useFocusRing(props)

    return (
        <button
            ref={mergeRefs([ref, forwardedRef])}
            className={twMerge(variants({variant, size, className}))}
            {...mergeProps(buttonProps, hoverProps, focusProps)}
            data-pressed={isPressed || undefined}
            data-hovered={isHovered || undefined}
            data-focus-visible={isFocusVisible || undefined}
        >
            {loading && <Loading/>}
            <span className={clsx('tw-transition', {'tw-opacity-0': loading, 'tw-opacity-100': !loading})}>{children}</span>
        </button>
    )
})

Button.displayName = 'Button'

export default Button