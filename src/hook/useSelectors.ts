import React, {Dispatch, SetStateAction, useState} from "react";
import {OnChangeValue} from "react-select";
import {TOption, createOption} from "@/interface";

interface IProps {
    options: TOption[],
    onChangeCallback?: (options: TOption | null) => void,
    onCreateCallback?: (options: TOption) => void,
    defaultValue?: TOption,
}

interface IMultiProps {
    options: TOption[],
    onChangeCallback?: (options: TOption[]) => void,
    onCreateCallback?: (options: TOption) => void,
    defaultValue?: TOption[],
}

// type TResult = [TOption[], Dispatch<SetStateAction<TOption[]>>, () => TOption | null | undefined, Dispatch<SetStateAction<TOption | null>>, (newValue: OnChangeValue<TOption, false>) => void, (inputValue: string) => void]
// type TMultiResult = [TOption[], Dispatch<SetStateAction<TOption[]>>, () => TOption[], Dispatch<SetStateAction<TOption[]>>, (newValue: OnChangeValue<TOption, true>) => void, (inputValue: string) => void]

type TResult = [TOption[], Dispatch<SetStateAction<TOption[]>>, TOption | null | undefined, Dispatch<SetStateAction<TOption | null>>, (newValue: OnChangeValue<TOption, false>) => void, (inputValue: string) => void]
type TMultiResult = [TOption[], Dispatch<SetStateAction<TOption[]>>, TOption[], Dispatch<SetStateAction<TOption[]>>, (newValue: OnChangeValue<TOption, true>) => void, (inputValue: string) => void]

export function useCreatableSelector({ options, onChangeCallback, onCreateCallback, defaultValue}: IProps): TResult {
    const [opts, setOpts] = useState(options);
    const [value, setValue] = useState(defaultValue ? defaultValue : null);

    const getValue = () => value ? opts.find(c => c === value) : null

    const onChange = (newValue: OnChangeValue<TOption, false>) => {
        setValue(newValue ? newValue : null)

        if (onChangeCallback) {
            onChangeCallback(value)
        }
    }

    const onCreateOption = (inputValue: string) => {
        const newOption = createOption(inputValue)
        setOpts(prev => [...prev, newOption])

        setValue(newOption)

        if (onCreateCallback) {
            onCreateCallback(newOption)
        }
    }

    return [opts, setOpts, value, setValue, onChange, onCreateOption]
}

export function useMultiCreatableSelector({options, onChangeCallback, onCreateCallback, defaultValue}: IMultiProps): TMultiResult {
    const [opts, setOpts] = useState(options);
    const [values, setValues] = useState(defaultValue ? defaultValue : []);

    const getValue = () => values ? opts.filter(c => values.indexOf(c) >= 0) : []

    const onChange = (newValue: OnChangeValue<TOption, true>) => {
        setValues(newValue.map(v => v))

        if (onChangeCallback) {
            onChangeCallback(values)
        }
    }

    const onCreateOption = (inputValue: string) => {
        const newOption = createOption(inputValue)
        setOpts(prev => [...prev, newOption])

        setValues(prev => [...prev, newOption])

        if (onCreateCallback) {
            onCreateCallback(newOption)
        }
    }

    return [opts, setOpts, values, setValues, onChange, onCreateOption]
}
