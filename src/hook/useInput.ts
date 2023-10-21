import {ChangeEvent, Dispatch, SetStateAction, useState} from "react";

type TInputValue = string | number | undefined;
type TInputChangeEvent = ChangeEvent<HTMLInputElement>;

const convert = <I extends TInputValue>(from: I, value: string) => {
    if (typeof from === 'string') {
        return value
    } else if (typeof from === 'number') {
        return Number(value)
    }
    return ''
}

export function useInput<I extends TInputValue>(initialValue: I): [I, Dispatch<SetStateAction<I>>, (e: TInputChangeEvent) => void, () => void] {
    const [value, setValue] = useState<string | number | undefined>(initialValue)

    const reset = () => {
        setValue(initialValue)
    }

    const onChange = (e: TInputChangeEvent) => {
        setValue(convert(initialValue, e.target.value))
    }

    return [value as I, setValue, onChange, reset]
}