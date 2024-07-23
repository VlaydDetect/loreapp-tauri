import React, { useState, useMemo } from 'react';
import type { SelectProps, TreeSelectProps } from 'antd';
import { TreeSelect, Divider, Input, Space, Button, type InputRef } from 'antd';
import type { BaseOptionType as SelectBOP, DefaultOptionType as SelectDOT } from 'antd/lib/select';

const { SHOW_PARENT, SHOW_ALL, SHOW_CHILD } = TreeSelect;

// TODO: in the next AntD version maybe would imported from `antd/lib/tree-select`
interface TreeSelectBOP {
    disabled?: boolean;
    checkable?: boolean;
    disableCheckbox?: boolean;
    children?: TreeSelectBOP[];
    [name: string]: any;
}
interface TreeSelectDOT extends TreeSelectBOP {
    value?: string | number;
    title?: React.ReactNode;
    label?: React.ReactNode;
    key?: React.Key;
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
    showIcon?: boolean;
    placement?: TreeSelectProps<ValueType, OptionType>['placement'];
    status?: TreeSelectProps<ValueType, OptionType>['status'];
    showCheckedStrategy?: 'all' | 'parent' | 'children';
    treeIcon?: TreeSelectProps<ValueType, OptionType>['treeIcon'];
    removeIcon?: TreeSelectProps<ValueType, OptionType>['removeIcon'];
    disabled?: boolean;
    variant?: TreeSelectProps<ValueType, OptionType>['variant'];
};

const useAntdTreeSelect = <
    ValueType = any,
    OptionType extends TreeSelectBOP | TreeSelectDOT = TreeSelectDOT,
>(
    props: TreeSelectInputs<ValueType, OptionType>,
): TreeSelectProps<ValueType, OptionType> => {
    const { defaultValue, onChangeCallback } = props;
    const [value, setValue] = useState(defaultValue);

    const onChange: TreeSelectProps<ValueType, OptionType>['onChange'] = (
        value,
        labelList,
        extra,
    ) => {
        setValue(value);
        if (onChangeCallback) {
            onChangeCallback(value, labelList, extra);
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

    return {
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
    };
};

type SelectInputs<ValueType = any, OptionType extends SelectBOP | SelectDOT = SelectDOT> = {
    defaultValue?: ValueType;
    disabled?: boolean;
    options?: SelectProps<ValueType, OptionType>['options'];
    onChangeCallback?: SelectProps<ValueType, OptionType>['onChange'];
    showSearch?: boolean;
    optionRender: SelectProps<ValueType, OptionType>['optionRender'];
    mode: 'multiple' | 'tags' | 'multipleWithCreation';
};

const useAntdSelect = <ValueType = any, OptionType extends SelectBOP | SelectDOT = SelectDOT>(
    props: SelectInputs<ValueType, OptionType>,
): SelectProps<ValueType, OptionType> => {
    const [options, setOptions] = useState<OptionType[]>([]);
    const [value, setValue] = useState<ValueType | undefined>(props.defaultValue);

    const onChange: SelectProps<ValueType, OptionType>['onChange'] = (value, option) => {
        setValue(value);
        if (props.onChangeCallback) {
            props.onChangeCallback(value, option);
        }
    };

    // Filter `option.label` match the user type `input`
    const filterOption = (input: string, option?: OptionType) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    type Mode = {
        mode: 'multiple' | 'tags';
        dropdownRender?: SelectProps<ValueType, OptionType>['dropdownRender'];
    };
    const { mode, dropdownRender } = useMemo(() => {
        switch (props.mode) {
            case 'multiple':
                return { mode: 'multiple' };
            case 'tags':
                return { mode: 'tags' };
            case 'multipleWithCreation': {
                const dropdownRender: SelectProps<
                    ValueType,
                    OptionType
                >['dropdownRender'] = menu => ({ menu });

                return { mode: 'multiple', dropdownRender };
            }
            default:
                return { mode: 'multiple' };
        }
    }, [props.mode]);

    return {
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
    };
};
