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

export function useInput(initialValue: string | undefined): [string, Dispatch<SetStateAction<string>>, (e: TInputChangeEvent) => void, () => void] {
    const [value, setValue] = useState<string>(initialValue ? initialValue : "")

    const reset = () => {
        setValue(initialValue ? initialValue : "")
    }

    const onChange = (e: TInputChangeEvent) => {
        setValue(e.target.value)
    }

    return [value, setValue, onChange, reset]
}