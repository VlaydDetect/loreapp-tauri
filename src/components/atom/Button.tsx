import {cva, VariantProps} from "class-variance-authority";
import clsx from "clsx";
import { twMerge } from 'tailwind-merge'
import {forwardRef, useRef} from "react";
import {AriaButtonProps, mergeProps, useButton, useFocusRing, useHover} from "react-aria";
import {mergeRefs} from "@/utils/utils"

const variants = cva(
    [
        'rounded-full', 'tracking-wide', 'cursor-pointer', 'inline-flex',
        'items-center', 'justify-center', 'relative', 'transition',
        'outline-none', 'data-[pressed=true]:scale-[0.98]', 'disabled:cursor-not-allowed'
    ],
    {
        variants: {
            variant: {
                primary: [
                    'bg-indigo-500', 'text-white', 'font-semibold', 'shadow',
                    'data-[hovered=true]:bg-indigo-600', 'data-[hovered=true]:shadow-md', 'data-[focus-visible=true]:ring-indigo-500/70', 'data-[focus-visible=true]:ring-offset-2',
                    'data-[focus-visible=true]:ring-2', 'disabled:!bg-indigo-500/50', 'disabled:!shadow'
                ],
                secondary: [
                    'font-normal', 'bg-gray-50', 'data-[hovered=true]:bg-gray-100', 'disabled:!bg-gray-50',
                    'text-gray-950', 'shadow', 'data-[hovered=true]:shadow-md', 'border',
                    'border-neutral-200/50', 'data-[focus-visible=true]:ring-offset-2', 'data-[focus-visible=true]:ring-2',
                    'data-[focus-visible=true]:ring-gray-200',
                ],
                destructive: [
                    'font-semibold', 'bg-red-500', 'text-white', 'rounded-full',
                    'shadow', 'data-[hovered=true]:shadow-md', 'disabled:!bg-red-500/50 disabled:!shadow', 'data-[focus-visible=true]:ring-offset-2',
                    'data-[focus-visible=true]:ring-2', 'data-[focus-visible=true]:ring-red-200'
                ],
                ghost: [
                    'font-light', 'text-gray-950', 'data-[hovered=true]:text-gray-600', 'disabled:!text-gray-950',
                    'data-[focus-visible=true]:ring-gray-300', 'data-[focus-visible=true]:ring-1'
                ],
                link: [
                    'font-light', 'data-[hovered=true]:text-indigo-600', 'disabled:!text-indigo-500/50', 'disabled:!no-underline'
                ],
            },
            size: {
                small: ['text-sm', 'py-1', 'px-4'],
                default: ['py-2', 'px-8', 'leading-6'],
                large: ['text-lg', 'py-3', 'px-12'],
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default'
        }
    }
)

const Loading = () => (
    <div className="absolute inline-flex items-center">
        <div className="w-4 h-4 rounded-full border-2 border-b-transparent animate-spin border-[inherit]"/>
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
            <span className={clsx('transition', {'opacity-0': loading, 'opacity-100': !loading})}>{children}</span>
        </button>
    )
})

Button.displayName = 'Button'

export default Button