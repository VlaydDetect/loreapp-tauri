import React, {Dispatch, SetStateAction, useState} from "react";
import {OnChangeValue} from "react-select";
import {createLabelValue, LabelValue} from "@/interface";

type Value = LabelValue | undefined;
type SetValue = Dispatch<SetStateAction<Value>>;
type OnChangeValueCallback = (newValue: OnChangeValue<Option, false>) => void;

type Values = LabelValue[];
type SetValues = Dispatch<SetStateAction<Values>>;
type OnChangeValuesCallback = (newValue: OnChangeValue<Option, true>) => void;

type Option = LabelValue;
type OnCreateOptionCallback = (inputValue: string) => void;
type Options = LabelValue[];
type SetOptions = Dispatch<SetStateAction<Options>>;

type Props = {
    options: Options,
    onChangeCallback?: (options: Value) => void,
    defaultValue?: Option,
}

type CreatableProps = Props & { onCreateCallback?: (options: Option) => void, };

interface IMultiProps {
    options: Options,
    onChangeCallback?: (options: Values) => void,
    defaultValue?: Options,
}

type CreatableMultiProps = IMultiProps & { onCreateCallback?: (options: Option) => void, };

type Result = {
    options: Options,
    setOptions: SetOptions,
    value: Value,
    setValue: SetValue,
    onChangeValue: OnChangeValueCallback,
}

type CreatableResult = Result & { onCreateOption: OnCreateOptionCallback }

type MultiResult = {
    options: Options,
    setOptions: SetOptions,
    values: Values,
    setValues: SetValues,
    onChangeValues: OnChangeValuesCallback,
}

type CreatableMultiResult = MultiResult & { onCreateOption: OnCreateOptionCallback }

export function useMultiSelector({options, onChangeCallback, defaultValue}: IMultiProps): MultiResult {
    const [opts, setOpts] = useState(options);
    const [values, setValues] = useState(defaultValue ? defaultValue : []);
    // const getValue = () => values ? opts.filter(c => values.indexOf(c) >= 0) : []

    const onChange = (newValue: OnChangeValue<LabelValue, true>) => {
        setValues(newValue.map(v => v))

        if (onChangeCallback) {
            onChangeCallback(values)
        }
    }

    return {
        options: opts,
        setOptions: setOpts,
        values, setValues,
        onChangeValues: onChange,
    }
}

export function useCreatableSelector({ options, onChangeCallback, onCreateCallback, defaultValue}: CreatableProps): CreatableResult {
    const [opts, setOpts] = useState(options);
    const [value, setValue] = useState(defaultValue);

    // const getValue = () => value ? opts.find(c => c === value) : null

    const onChange = (newValue: OnChangeValue<LabelValue, false>) => {
        setValue(newValue ? newValue : undefined)

        if (onChangeCallback) {
            onChangeCallback(value)
        }
    }

    const onCreateOption = (inputValue: string) => {
        const newOption = createLabelValue(inputValue)
        setOpts(prev => [...prev, newOption])

        setValue(newOption)

        if (onCreateCallback) {
            onCreateCallback(newOption)
        }
    }

    return {
        options: opts,
        setOptions: setOpts,
        value, setValue,
        onChangeValue: onChange,
        onCreateOption: onCreateOption
    }
}

export function useCreatableMultiSelector({options, onChangeCallback, onCreateCallback, defaultValue}: CreatableMultiProps): CreatableMultiResult {
    const [opts, setOpts] = useState(options);
    const [values, setValues] = useState(defaultValue ? defaultValue : []);

    // const getValue = () => values ? opts.filter(c => values.indexOf(c) >= 0) : []

    const onChange = (newValue: OnChangeValue<LabelValue, true>) => {
        setValues(newValue.map(v => v))

        if (onChangeCallback) {
            onChangeCallback(values)
        }
    }

    const onCreateOption = (inputValue: string) => {
        const newOption = createLabelValue(inputValue)
        setOpts(prev => [...prev, newOption])

        setValues(prev => [...prev, newOption])

        if (onCreateCallback) {
            onCreateCallback(newOption)
        }
    }

    return {
        options: opts,
        setOptions: setOpts,
        values, setValues,
        onChangeValues: onChange,
        onCreateOption: onCreateOption
    }
}
