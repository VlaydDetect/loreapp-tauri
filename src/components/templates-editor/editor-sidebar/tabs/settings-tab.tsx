import React, { useMemo } from 'react';
import {
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignHorizontalJustifyStart,
    AlignHorizontalSpaceAround,
    AlignHorizontalSpaceBetween,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart,
    ChevronsLeftRightIcon,
    LucideImageDown,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { useTemplatesEditor } from '../../editor-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsTab: React.FC = () => {
    const { state, dispatch } = useTemplatesEditor();

    const getOpacity = useMemo(
        () =>
            typeof state.editor.selectedElement.styles?.opacity === 'number'
                ? state.editor.selectedElement.styles?.opacity
                : parseFloat(
                      (state.editor.selectedElement.styles?.opacity || '0').replace('%', ''),
                  ) || 0,
        [state.editor.selectedElement.styles.opacity],
    );

    const getBorderRadius = useMemo(
        () =>
            typeof state.editor.selectedElement.styles?.borderRadius === 'number'
                ? state.editor.selectedElement.styles?.borderRadius
                : parseFloat(
                      (state.editor.selectedElement.styles?.borderRadius || '0').replace('px', ''),
                  ) || 0,
        [state.editor.selectedElement.styles.borderRadius],
    );

    const handleOnChange = (id: string, value: string) => {
        const styleObject = {
            [id]: value,
        };

        dispatch({
            type: 'UPDATE_ELEMENT',
            payload: {
                elementDetails: {
                    ...state.editor.selectedElement,
                    styles: {
                        ...state.editor.selectedElement.styles,
                        ...styleObject,
                    },
                },
            },
        });
    };

    return (
        <Accordion
            type="multiple"
            className="tw-w-full"
            defaultValue={['Dimensions', 'Decorations', 'Flexbox']}
        >
            <AccordionItem value="Dimensions" className="tw-px-6 tw-py-0">
                <AccordionTrigger className="!tw-no-underline">Dimensions</AccordionTrigger>
                <AccordionContent>
                    <div className="tw-flex tw-flex-col tw-gap-4">
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <div className="tw-flex tw-gap-4 tw-flex-col">
                                <div className="tw-flex tw-gap-4">
                                    <div>
                                        <Label className="tw-text-muted-foreground">Height</Label>
                                        <Input
                                            id="height"
                                            placeholder="px"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.height}
                                        />
                                    </div>
                                    <div>
                                        <Label className="tw-text-muted-foreground">Width</Label>
                                        <Input
                                            placeholder="px"
                                            id="width"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.width}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p>Margin px</p>
                            <div className="tw-flex tw-gap-4 tw-flex-col">
                                <div className="tw-flex tw-gap-4">
                                    <div>
                                        <Label className="tw-text-muted-foreground">Top</Label>
                                        <Input
                                            id="marginTop"
                                            placeholder="px"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.marginTop}
                                        />
                                    </div>
                                    <div>
                                        <Label className="tw-text-muted-foreground">Bottom</Label>
                                        <Input
                                            placeholder="px"
                                            id="marginBottom"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.marginBottom}
                                        />
                                    </div>
                                </div>
                                <div className="tw-flex tw-gap-4">
                                    <div>
                                        <Label className="tw-text-muted-foreground">Left</Label>
                                        <Input
                                            placeholder="px"
                                            id="marginLeft"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.marginLeft}
                                        />
                                    </div>
                                    <div>
                                        <Label className="tw-text-muted-foreground">Right</Label>
                                        <Input
                                            placeholder="px"
                                            id="marginRight"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.marginRight}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <p>Padding px</p>
                            <div className="tw-flex tw-gap-4 tw-flex-col">
                                <div className="tw-flex tw-gap-4">
                                    <div>
                                        <Label className="tw-text-muted-foreground">Top</Label>
                                        <Input
                                            placeholder="px"
                                            id="paddingTop"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.paddingTop}
                                        />
                                    </div>
                                    <div>
                                        <Label className="tw-text-muted-foreground">Bottom</Label>
                                        <Input
                                            placeholder="px"
                                            id="paddingBottom"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={
                                                state.editor.selectedElement.styles.paddingBottom
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="tw-flex tw-gap-4">
                                    <div>
                                        <Label className="tw-text-muted-foreground">Left</Label>
                                        <Input
                                            placeholder="px"
                                            id="paddingLeft"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.paddingLeft}
                                        />
                                    </div>
                                    <div>
                                        <Label className="tw-text-muted-foreground">Right</Label>
                                        <Input
                                            placeholder="px"
                                            id="paddingRight"
                                            onChange={event =>
                                                handleOnChange(event.target.id, event.target.value)
                                            }
                                            value={state.editor.selectedElement.styles.paddingRight}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="Decorations" className="tw-px-6 tw-py-0 ">
                <AccordionTrigger className="!tw-no-underline">Decorations</AccordionTrigger>
                <AccordionContent className="tw-flex tw-flex-col tw-gap-4">
                    <div>
                        <Label className="tw-text-muted-foreground">Opacity</Label>
                        <div className="tw-flex tw-items-center tw-justify-end">
                            <small className="tw-p-2">{getOpacity}%</small>
                        </div>
                        <Slider
                            onValueChange={e => handleOnChange('opacity', `${e[0]}%`)}
                            defaultValue={[getOpacity]}
                            max={100}
                            step={1}
                        />
                    </div>
                    <div>
                        <Label className="tw-text-muted-foreground">Border Radius</Label>
                        <div className="tw-flex tw-items-center tw-justify-end">
                            <small className="">{getBorderRadius}px</small>
                        </div>
                        <Slider
                            onValueChange={e => handleOnChange('borderRadius', `${e[0]}px`)}
                            defaultValue={[getBorderRadius]}
                            max={100}
                            step={1}
                        />
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-2">
                        <Label className="tw-text-muted-foreground">Background Color</Label>
                        <div className="tw-flex tw-border-px tw-rounded-md tw-overflow-clip">
                            <div
                                className="tw-w-12"
                                style={{
                                    backgroundColor:
                                        state.editor.selectedElement.styles.backgroundColor,
                                }}
                            />
                            <Input
                                placeholder="#HFI245"
                                className="!tw-border-y-0 tw-rounded-none !tw-border-r-0 tw-mr-2"
                                id="backgroundColor"
                                onChange={event =>
                                    handleOnChange(event.target.id, event.target.value)
                                }
                                value={state.editor.selectedElement.styles.backgroundColor}
                            />
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-2">
                        <Label className="tw-text-muted-foreground">Background Image</Label>
                        <div className="tw-flex tw-border-px tw-rounded-md tw-overflow-clip">
                            <div
                                className="tw-w-12"
                                style={{
                                    backgroundImage:
                                        state.editor.selectedElement.styles.backgroundImage,
                                }}
                            />
                            <Input
                                placeholder="url()"
                                className="!tw-border-y-0 tw-rounded-none !tw-border-r-0 tw-mr-2"
                                id="backgroundImage"
                                onChange={event =>
                                    handleOnChange(event.target.id, event.target.value)
                                }
                                value={state.editor.selectedElement.styles.backgroundImage}
                            />
                        </div>
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-2">
                        <Label className="tw-text-muted-foreground">Image Position</Label>
                        <Tabs
                            onValueChange={e => handleOnChange('backgroundSize', e)}
                            value={state.editor.selectedElement.styles.backgroundSize?.toString()}
                        >
                            <TabsList className="tw-flex tw-items-center tw-flex-row tw-justify-between tw-border-px tw-rounded-md tw-bg-transparent tw-h-fit tw-gap-4">
                                <TabsTrigger
                                    value="cover"
                                    className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                                >
                                    <ChevronsLeftRightIcon size={18} />
                                </TabsTrigger>
                                <TabsTrigger
                                    value="contain"
                                    className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                                >
                                    <AlignVerticalJustifyCenter size={22} />
                                </TabsTrigger>
                                <TabsTrigger
                                    value="auto"
                                    className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                                >
                                    <LucideImageDown size={18} />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="Flexbox" className="tw-px-6 tw-py-0">
                <AccordionTrigger className="!tw-no-underline">Flexbox</AccordionTrigger>
                <AccordionContent>
                    <Label className="tw-text-muted-foreground">Justify Content</Label>
                    <Tabs
                        onValueChange={e => handleOnChange('justifyContent', e)}
                        value={state.editor.selectedElement.styles.justifyContent}
                    >
                        <TabsList className="tw-flex tw-items-center tw-flex-row tw-justify-between tw-border-px tw-rounded-md tw-bg-transparent tw-h-fit tw-gap-4">
                            <TabsTrigger
                                value="space-between"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignHorizontalSpaceBetween size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                                value="space-evenly"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignHorizontalSpaceAround size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                                value="center"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignHorizontalJustifyCenter size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                                value="start"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignHorizontalJustifyStart size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                                value="end"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignHorizontalJustifyEnd size={18} />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Label className="tw-text-muted-foreground">Align Items</Label>
                    <Tabs
                        onValueChange={e => handleOnChange('alignItems', e)}
                        value={state.editor.selectedElement.styles.alignItems}
                    >
                        <TabsList className="tw-flex tw-items-center tw-flex-row tw-justify-between tw-border-px tw-rounded-md tw-bg-transparent tw-h-fit tw-gap-4">
                            <TabsTrigger
                                value="center"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignVerticalJustifyCenter size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                                value="normal"
                                className="tw-w-10 tw-h-10 tw-p-0 data-[state=active]:tw-bg-muted"
                            >
                                <AlignVerticalJustifyStart size={18} />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <Input
                            className="tw-h-4 tw-w-4"
                            placeholder="px"
                            type="checkbox"
                            id="display"
                            onChange={va =>
                                handleOnChange('display', va.target.checked ? 'flex' : 'block')
                            }
                        />
                        <Label className="tw-text-muted-foreground">Flex</Label>
                    </div>
                    <div>
                        <Label className="tw-text-muted-foreground">Direction</Label>
                        <Input
                            placeholder="px"
                            id="flexDirection"
                            onChange={event => handleOnChange(event.target.id, event.target.value)}
                            value={state.editor.selectedElement.styles.flexDirection}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default SettingsTab;
