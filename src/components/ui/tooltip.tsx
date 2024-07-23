import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            'tw-z-50 tw-overflow-hidden tw-rounded-md tw-border tw-bg-popover tw-px-3 tw-py-1.5 tw-text-sm tw-text-popover-foreground tw-shadow-md tw-animate-in tw-fade-in-0 tw-zoom-in-95 data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=closed]:tw-zoom-out-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2',
            className,
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type ItemProps = {
    trigger: React.ReactNode;
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    disableClasses?: boolean;
    mergeClasses?: boolean;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const TooltipItem: React.FC<ItemProps> = props => {
    const { trigger, content, side, align, disableClasses, mergeClasses, className, onClick } =
        props;

    return (
        <Tooltip delayDuration={250} disableHoverableContent>
            <TooltipTrigger
                asChild
                onClick={onClick}
                className={
                    className
                        ? mergeClasses
                            ? disableClasses
                                ? className
                                : cn(
                                      'tw-items-center tw-rounded-md tw-border-none tw-bg-transparent tw-p-[5px] tw-shadow-none hover:tw-border-none hover:tw-bg-gray-100/10',
                                      className,
                                  )
                            : disableClasses
                              ? className
                              : 'tw-items-center tw-rounded-md tw-border-none tw-bg-transparent tw-p-[5px] tw-shadow-none hover:tw-border-none hover:tw-bg-gray-100/10'
                        : disableClasses
                          ? ''
                          : 'tw-items-center tw-rounded-md tw-border-none tw-bg-transparent tw-p-[5px] tw-shadow-none hover:tw-border-none hover:tw-bg-gray-100/10'
                }
            >
                {trigger}
            </TooltipTrigger>
            <TooltipContent
                side={side}
                align={align || 'center'}
                className="tw-flex tw-h-7 tw-items-center !tw-border-black !tw-bg-black/40 tw-text-white !tw-backdrop-blur-xl"
            >
                <p className="tw-text-tooltip tw-font-semibold tw-capitalize">{content}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipItem };
