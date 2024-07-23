import React, { useState, useMemo, useRef } from 'react';
import {
    TreeSelect,
    Divider,
    Input,
    Space,
    Button,
    Tooltip,
    type InputRef,
    type SelectProps,
    type TreeSelectProps,
} from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';

const { SHOW_PARENT, SHOW_ALL, SHOW_CHILD } = TreeSelect;

interface TreeSelectBOP {
    disabled?: boolean;
    checkable?: boolean;
    disableCheckbox?: boolean;
    children?: TreeSelectBOP[];
    [name: string]: any;
}
interface TreeSelectDOT extends TreeSelectBOP {
    value: string;
    // title?: React.ReactNode;
    label: string;
    // key?: React.Key;
    children?: TreeSelectDOT[];
}

type TreeSelectInputs<
    ValueType = any,
    OptionType extends TreeSelectBOP | TreeSelectDOT = TreeSelectDOT,
> = {
    treeData?: TreeSelectProps<ValueType, OptionType>['treeData'];
    isMultiple?: boolean;
    isCheckable?: boolean;
    showSearch?: boolean;
    defaultValue?: ValueType;
    onChangeCallback?: TreeSelectProps<ValueType, OptionType>['onChange'];
    showTreeLine?: boolean;
    showLeafIcon?: boolean;
    // showIcon?: boolean;
    placement?: TreeSelectProps<ValueType, OptionType>['placement'];
    status?: TreeSelectProps<ValueType, OptionType>['status'];
    showCheckedStrategy?: 'all' | 'parent' | 'children';
    treeIcon?: TreeSelectProps<ValueType, OptionType>['treeIcon'];
    removeIcon?: TreeSelectProps<ValueType, OptionType>['removeIcon'];
    disabled?: boolean;
    variant?: TreeSelectProps<ValueType, OptionType>['variant'];
};

export const useAntdTreeSelect = <
    ValueType = any,
    OptionType extends TreeSelectBOP | TreeSelectDOT = TreeSelectDOT,
>(
    props: TreeSelectInputs<ValueType, OptionType>,
): [TreeSelectProps<ValueType, OptionType>, ValueType] => {
    // @ts-ignore
    const [value, setValue] = useState<ValueType>(props.defaultValue || []);

    const onChange: TreeSelectProps<ValueType, OptionType>['onChange'] = (
        val,
        labelList,
        extra,
    ) => {
        setValue(val);
        if (props.onChangeCallback) {
            props.onChangeCallback(val, labelList, extra);
        }
    };

    const showCheckedStrategy = useMemo(() => {
        switch (props.showCheckedStrategy) {
            case 'all':
                return SHOW_ALL;
            case 'children':
                return SHOW_CHILD;
            case 'parent':
                return SHOW_PARENT;
            default:
                return SHOW_ALL;
        }
    }, [props.showCheckedStrategy]);

    return [
        {
            labelInValue: true,
            allowClear: true,
            showSearch: props.showSearch || false,
            value,
            treeData: props.treeData,
            onChange,
            multiple: props.isMultiple || false,
            placement: props.placement || 'bottomLeft',
            status: props.status,
            treeCheckable: props.isCheckable || false,
            showCheckedStrategy,
            treeIcon: props.treeIcon,
            removeIcon: props.removeIcon,
            disabled: props.disabled || false,
            treeLine: props.showTreeLine && { showLeafIcon: props.showLeafIcon },
            variant: props.variant,
        },
        value,
    ];
};

interface SelectBOP {
    disabled?: boolean;
    className?: string;
    title?: string;
    [name: string]: any;
}

export interface SelectDOT extends SelectBOP {
    label: React.ReactNode;
    value: string | number | null;
    children?: Omit<SelectDOT, 'children'>[]; // TODO: for options groups
}

type SelectInputs<ValueType = any, OptionType extends SelectBOP | SelectDOT = SelectDOT> = {
    onCreate: (name: string) => Promise<OptionType>;
    defaultNewOptionName: string;
    defaultValue?: ValueType;
    disabled?: boolean;
    options?: SelectProps<ValueType, OptionType>['options'];
    onChangeCallback?: SelectProps<ValueType, OptionType>['onChange'];
    showSearch?: boolean;
    optionRender?: SelectProps<ValueType, OptionType>['optionRender'];
    mode?: 'multiple' | 'tags' | 'multipleWithCreation';
    tagRender?: SelectProps<ValueType, OptionType>['tagRender'];
    variant?: SelectProps<ValueType, OptionType>['variant'];
    status?: SelectProps<ValueType, OptionType>['status'];
    placement?: SelectProps<ValueType, OptionType>['placement'];
    maxCount?: number;
};

export const useAntdSelect = <
    ValueType = any,
    OptionType extends SelectBOP | SelectDOT = SelectDOT,
>(
    props: SelectInputs<ValueType, OptionType>,
): [SelectProps<ValueType, OptionType>, ValueType] => {
    const [options, setOptions] = useState<OptionType[]>(props.options || []);
    // @ts-ignore
    const [value, setValue] = useState<ValueType>(props.defaultValue || []);

    const onChange: SelectProps<ValueType, OptionType>['onChange'] = (val, option) => {
        setValue(val);
        if (props.onChangeCallback) {
            props.onChangeCallback(val, option);
        }
    };

    // Filter `option.label` match the user type `input`
    const filterOption = (input: string, option?: OptionType) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    type Mode = {
        mode?: 'multiple' | 'tags';
        dropdownRender?: SelectProps<ValueType, OptionType>['dropdownRender'];
    };

    const [name, setName] = useState<string | undefined>(undefined);
    const inputRef = useRef<InputRef>(null);

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const { mode, dropdownRender }: Mode = useMemo(() => {
        switch (props.mode) {
            case 'multiple':
                return { mode: 'multiple' };
            case 'tags':
                return { mode: 'tags' };
            case 'multipleWithCreation': {
                const addItem = async (e: React.MouseEvent) => {
                    e.preventDefault();
                    const newOption = await props.onCreate(name || props.defaultNewOptionName);
                    setOptions(prev => [...prev, newOption]);
                    setName('');
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 0);
                };

                const render: SelectProps<ValueType, OptionType>['dropdownRender'] = menu => (
                    <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                            <Input
                                placeholder="Please enter item"
                                ref={inputRef}
                                value={name}
                                onChange={onNameChange}
                                onKeyDown={e => e.stopPropagation()}
                            />
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={async event => addItem(event)}
                            >
                                Add item
                            </Button>
                        </Space>
                    </>
                );

                return { mode: 'multiple', dropdownRender: render };
            }
            default:
                return {};
        }
    }, [name, props.mode, props.onCreate]);

    const suffix = useMemo(() => {
        if (props.maxCount && props.mode) {
            return (
                <>
                    <span>
                        {/* @ts-ignore */}
                        {value.length} / {props.maxCount}
                    </span>
                    <DownOutlined />
                </>
            );
        }
        return undefined;
        // @ts-ignore
    }, [props.maxCount, props.mode, value.length]);

    return [
        {
            labelInValue: true,
            allowClear: true,
            options,
            value,
            disabled: props.disabled || false,
            onChange,
            showSearch: props.showSearch || false,
            filterOption,
            optionRender: props.optionRender,
            mode,
            dropdownRender,
            tagRender: props.tagRender,
            status: props.status,
            placement: props.placement || 'bottomLeft',
            maxCount: props.maxCount,
            suffixIcon: suffix,
            maxTagCount: 'responsive',
            maxTagPlaceholder: omittedValues => (
                <Tooltip title={omittedValues.map(({ label }) => label).join(', ')}>
                    <span>+ {omittedValues.length}...</span>
                </Tooltip>
            ),
        },
        value,
    ];
};

export type { TreeSelectDOT as TreeOptionType };
