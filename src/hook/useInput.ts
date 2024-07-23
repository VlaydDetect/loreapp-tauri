import React, { ChangeEvent, useState } from 'react';

type TChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type InputReturn = {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    onChange: (e: TChangeEvent) => void;
    reset: () => void;
};

export function useInput(initialValue: string | undefined): InputReturn {
    const [value, setValue] = useState<string>(initialValue || '');

    const reset = () => {
        setValue(initialValue || '');
    };

    const onChange = (e: TChangeEvent) => {
        setValue(e.target.value);
    };

    return { value, setValue, onChange, reset };
}
