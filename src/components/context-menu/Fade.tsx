import React, { CSSProperties } from 'react';
import { Transition } from 'react-transition-group';
import { TransitionProps } from './transitions/transitions';
import { useForkRef } from '@/hook';
import { getTransitionProps, reflow } from './transitions/utils';
import transitions from './transitions/createTransitions';
import type {
    TransitionStatus,
    EnterHandler,
    ExitHandler,
} from 'react-transition-group/Transition';

type Styles = {
    [K in TransitionStatus]?: CSSProperties;
};

const styles: Styles = {
    entering: {
        opacity: 1,
    },
    entered: {
        opacity: 1,
    },
};

interface Props extends Omit<TransitionProps, 'children'> {
    /**
     * Perform the enter transition when it first mounts if `in` is also `true`.
     * Set this to `false` to disable this behavior.
     * @default true
     */
    appear?: boolean;
    /**
     * A single child content element.
     */
    children: React.ReactElement<any, any>;
    /**
     * The transition timing function.
     * You may specify a single easing or a object containing enter and exit values.
     */
    easing?: TransitionProps['easing'];
    /**
     * If `true`, the component will transition in.
     */
    in?: boolean;
    ref?: React.Ref<Transition<HTMLElement | undefined>>;
    /**
     * The duration for the transition, in milliseconds.
     * You may specify a single timeout for all transitions, or individually with an object.
     * @default {
     *   enter: theme.transitions.duration.enteringScreen,
     *   exit: theme.transitions.duration.leavingScreen,
     * }
     */
    timeout?: TransitionProps['timeout'];
}

/**
 * The Fade transition is used by the [Modal](/material-ui/react-modal/) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Fade = React.forwardRef<Transition<HTMLElement | undefined>, Props>((props, ref) => {
    const defaultTimeout = {
        enter: transitions.duration.enteringScreen,
        exit: transitions.duration.leavingScreen,
    };

    const {
        addEndListener,
        appear = true,
        children,
        easing,
        in: inProp,
        onEnter,
        onEntered,
        onEntering,
        onExit,
        onExited,
        onExiting,
        style,
        timeout = defaultTimeout,
        ...other
    } = props;

    const enableStrictModeCompat = true;
    const nodeRef = React.useRef<HTMLElement | undefined>(null);
    const handleRef = useForkRef(nodeRef, children.props.ref, ref);

    // FIXME:
    const normalizedTransitionCallback = (callback: any) => (maybeIsAppearing: any) => {
        if (callback) {
            const node = nodeRef.current;

            // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
            if (maybeIsAppearing === undefined) {
                callback(node);
            } else {
                callback(node, maybeIsAppearing);
            }
        }
    };

    const handleEntering = normalizedTransitionCallback(onEntering);

    //@ts-ignore
    const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
        reflow(node); // So the animation always start from the start.

        const transitionProps = getTransitionProps(
            { style, timeout, easing },
            {
                mode: 'enter',
            },
        );

        node.style.webkitTransition = transitions.create('opacity', transitionProps);
        node.style.transition = transitions.create('opacity', transitionProps);

        if (onEnter) {
            onEnter(node, isAppearing);
        }
    });

    const handleEntered = normalizedTransitionCallback(onEntered);

    const handleExiting = normalizedTransitionCallback(onExiting);

    //@ts-ignore
    const handleExit = normalizedTransitionCallback(node => {
        const transitionProps = getTransitionProps(
            { style, timeout, easing },
            {
                mode: 'exit',
            },
        );

        node.style.webkitTransition = transitions.create('opacity', transitionProps);
        node.style.transition = transitions.create('opacity', transitionProps);

        if (onExit) {
            onExit(node);
        }
    });

    const handleExited = normalizedTransitionCallback(onExited);

    const handleAddEndListener = (next: () => void) => {
        if (addEndListener && nodeRef.current) {
            // Old call signature before `react-transition-group` implemented `nodeRef`
            addEndListener(nodeRef.current, next);
        }
    };

    return (
        <Transition
            appear={appear}
            in={inProp}
            nodeRef={enableStrictModeCompat ? nodeRef : undefined}
            onEnter={handleEnter}
            onEntered={handleEntered}
            onEntering={handleEntering}
            onExit={handleExit}
            onExited={handleExited}
            onExiting={handleExiting}
            addEndListener={handleAddEndListener}
            timeout={timeout}
            {...other}
        >
            {(state, childProps) => {
                return React.cloneElement(children, {
                    style: {
                        opacity: 0,
                        visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
                        ...styles[state],
                        ...style,
                        ...children.props.style,
                    },
                    ref: handleRef,
                    ...childProps,
                });
            }}
        </Transition>
    );
});

export { Fade };
export type { Props as FadeProps };
