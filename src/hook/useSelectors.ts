import React, {Dispatch, SetStateAction, useState} from "react";
import {OnChangeValue} from "react-select";
import {createOption, LabelValue} from "@/interface";

interface IProps {
    options: LabelValue[],
    onChangeCallback?: (options: LabelValue | null) => void,
    onCreateCallback?: (options: LabelValue) => void,
    defaultValue?: LabelValue,
}

interface IMultiProps {
    options: LabelValue[],
    onChangeCallback?: (options: LabelValue[]) => void,
    onCreateCallback?: (options: LabelValue) => void,
    defaultValue?: LabelValue[],
}

// type TResult = [LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, () => LabelValue | null | undefined, Dispatch<SetStateAction<LabelValue | null>>, (newValue: OnChangeValue<LabelValue, false>) => void, (inputValue: string) => void]
// type TMultiResult = [LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, () => LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, (newValue: OnChangeValue<LabelValue, true>) => void, (inputValue: string) => void]

type TResult = [LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, LabelValue | null | undefined, Dispatch<SetStateAction<LabelValue | null>>, (newValue: OnChangeValue<LabelValue, false>) => void, (inputValue: string) => void]
type TMultiResult = [LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, LabelValue[], Dispatch<SetStateAction<LabelValue[]>>, (newValue: OnChangeValue<LabelValue, true>) => void, (inputValue: string) => void]

export function useCreatableSelector({ options, onChangeCallback, onCreateCallback, defaultValue}: IProps): TResult {
    const [opts, setOpts] = useState(options);
    const [value, setValue] = useState(defaultValue ? defaultValue : null);

    const getValue = () => value ? opts.find(c => c === value) : null

    const onChange = (newValue: OnChangeValue<LabelValue, false>) => {
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

    const onChange = (newValue: OnChangeValue<LabelValue, true>) => {
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
