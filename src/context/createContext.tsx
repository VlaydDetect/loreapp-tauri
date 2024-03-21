import React from 'react';

type CreateContextResult<ContextValueType extends object | null> = [
    (props: ContextValueType & { children: React.ReactNode }) => React.ReactElement,
    (consumerName: string) => ContextValueType,
];

function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType
): CreateContextResult<ContextValueType> {
    const Context = React.createContext<ContextValueType | undefined>(defaultContext);

    function Provider(props: ContextValueType & { children: React.ReactNode }) {
        const { children, ...context } = props;
        // Only re-memoize when prop values change
        const value = React.useMemo(() => context, Object.values(context)) as ContextValueType;
        const Context = React.createContext<ContextValueType | undefined>(defaultContext);
        return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useContext(consumerName: string) {
        const context = React.useContext(Context);
        if (context) return context;
        if (defaultContext !== undefined) return defaultContext;
        // if a defaultContext wasn't specified, it's a required context.
        throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }

    Provider.displayName = rootComponentName + 'Provider';
    return [Provider, useContext] as const;
}

export {createContext};
