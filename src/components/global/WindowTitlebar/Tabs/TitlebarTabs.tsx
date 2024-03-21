import React from 'react';
import { useTabsContext } from '@/context/TabsProvider';
import { motion, useAnimate } from 'framer-motion';
import { TooltipItem, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/utils';
import { Plus, X } from 'lucide-react';

type Props = {
    focused: boolean;
};

// TODO: Make corners rounded (refs: https://github.com/saadeghi/daisyui/blob/master/src/components/styled/tab.css, https://daisyui.com/components/tab/)
const TitlebarTabs: React.FC<Props> = ({ focused }) => {
    const { tabs, newTab, removeTab, activeTab, setActiveTab } = useTabsContext();
    const [scope, animate] = useAnimate<HTMLUListElement>();

    const handleRemoveTab = async (id: string) => {
        await animate(`#tab-id-${id}`, { scaleX: 0, opacity: 0 }, { duration: 0.15 });
        removeTab(id);
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        const el = event.currentTarget;

        if (event.deltaY !== 0) {
            // event.preventDefault();
            el.scrollTo({
                left: el.scrollLeft + event.deltaY,
                behavior: 'smooth',
            });
        }
    };

    return (
        <TooltipProvider>
            <div
                data-tauri-drag-region
                className="tw-flex tw-flex-auto tw-list-none tw-p-0 tw-m-0 tw-h-full tw-text-white-gray tw-overflow-x-auto tw-overflow-y-hidden tw-scrollbar-hide"
                onWheel={event => handleWheel(event)}
            >
                <ul data-tauri-drag-region className="tw-flex" ref={scope}>
                    {tabs.map(tab => (
                        <TooltipItem
                            key={`tab-${tab.id}`}
                            disableClasses
                            className={
                                tab.id === activeTab.id
                                    ? ''
                                    : 'tw-bg-transparent hover:tw-bg-gray-100/10 tw-shadow-none tw-border-none hover:tw-border-none tw-rounded-md'
                            }
                            trigger={
                                <motion.li
                                    id={`tab-id-${tab.id}`}
                                    style={{
                                        transformOrigin: 'left',
                                    }}
                                    layout="position"
                                    layoutId={tab.id}
                                    initial={{
                                        scaleX: 0,
                                    }}
                                    animate={{
                                        scaleX: 1,
                                    }}
                                    transition={{
                                        duration: 0.15,
                                    }}
                                    exit={{
                                        scaleX: 0,
                                    }}
                                    className={cn(
                                        'tw-flex tw-relative tw-m-[0_1em] tw-mr-0 tw-p-[0.5em_1em] tw-items-center tw-justify-between tw-w-[150px] tw-rounded-[5px] tw-text-white-gray',
                                        {
                                            'tw-rounded-br-[px] tw-rounded-bl-[0px] tw-relative tw-bg-rough-grey tw-h-[calc(var(--titlebar-height)_-_5px)] tw-top-[5px]':
                                                tab.id === activeTab.id,
                                        },
                                        {
                                            'tw-h-[calc(var(--titlebar-height)_-_10px)] tw-top-[5px] tw-bg-transparent':
                                                tab.id !== activeTab.id,
                                        },
                                        {
                                            'tw-border-[1px] tw-border-b-0 tw-border-light-gray':
                                                !focused && tab.id === activeTab.id,
                                        },
                                    )}
                                >
                                    <p className="tw-font-normal tw-text-[12px] tw-text-white-gray">
                                        {tab.name}
                                    </p>
                                    <TooltipItem
                                        trigger={
                                            <span>
                                                <X size={16} />
                                            </span>
                                        }
                                        content={'Close'}
                                        side="bottom"
                                        onClick={event => {
                                            event.stopPropagation();
                                            handleRemoveTab(tab.id);
                                        }}
                                    />
                                </motion.li>
                            }
                            content={tab.name}
                            side="bottom"
                            onClick={() => setActiveTab(tab)}
                        />
                    ))}
                </ul>
                <TooltipItem
                    trigger={
                        <div className="tw-items-center tw-m-[0.5em] tw-h-fit tw-w-fit">
                            <Plus size={16} />
                        </div>
                    }
                    content={'New Tab'}
                    side="bottom"
                    onClick={() => newTab()}
                />
            </div>
        </TooltipProvider>
    );
};

export default TitlebarTabs;
