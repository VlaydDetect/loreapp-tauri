import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForkRef } from '@/hook';
import { setRef } from '@/utils';

interface Props {
    /**
     * The children to render into the `container`.
     */
    children?: React.ReactNode;
    /**
     * An HTML element or function that returns one.
     * The `container` will have the portal children appended to it.
     *
     * You can also provide a callback, which is called in a React layout effect.
     * This lets you set the container from a ref, and also makes server-side rendering possible.
     *
     * By default, it uses the body of the top-level document object,
     * so it's simply `document.body` most of the time.
     */
    container?: Element | (() => Element | null) | null;
    /**
     * The `children` will be under the DOM hierarchy of the parent component.
     * @default false
     */
    disablePortal?: boolean;
}

function getContainer(container: Props['container']) {
    return typeof container === 'function' ? container() : container;
}

const Portal = React.forwardRef<Element, Props>((props, ref) => {
    const { children, container, disablePortal = false } = props;
    const [mountNode, setMountNode] = React.useState<ReturnType<typeof getContainer>>(null);
    // @ts-expect-error TODO upstream fix
    const handleRef = useForkRef(React.isValidElement(children) ? children.ref : null, ref);

    useEffect(() => {
        if (!disablePortal) {
            setMountNode(getContainer(container) || document.body);
        }
    }, [container, disablePortal]);

    useEffect(() => {
        if (mountNode && !disablePortal) {
            setRef(ref, mountNode);
            return () => {
                setRef(ref, null);
            };
        }

        return undefined;
    }, [ref, mountNode, disablePortal]);

    if (disablePortal) {
        if (React.isValidElement(children)) {
            const newProps = {
                ref: handleRef,
            };
            return React.cloneElement(children, newProps);
        }
        return <React.Fragment>{children}</React.Fragment>;
    }

    return (
        <React.Fragment>
            {mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode}
        </React.Fragment>
    );
}) as React.ForwardRefExoticComponent<Props & React.RefAttributes<Element>>;

export { Portal };
export type { Props as PortalProps };
