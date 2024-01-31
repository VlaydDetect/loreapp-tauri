import { ObjectUtils, classNames } from '@/utils';

export type IconBaseProps = {
    __TYPE: string,
    className: string | null,
    label: string | null,
    spin: boolean
};

export const IconBase = {
    defaultProps: {
        __TYPE: 'IconBase',
        className: null,
        label: null,
        spin: false
    } as IconBaseProps,
    getProps: (props: IconBaseProps) => ObjectUtils.getMergedProps(props, IconBase.defaultProps),
    getOtherProps: (props: IconBaseProps) => ObjectUtils.getDiffProps(props, IconBase.defaultProps),
    getPTI: (props: IconBaseProps) => {
        const isLabelEmpty = ObjectUtils.isEmpty(props.label);
        const otherProps = IconBase.getOtherProps(props);
        const ptiProps = {
            className: classNames(
                'p-icon',
                {
                    'p-icon-spin': props.spin
                },
                props.className
            ),
            role: !isLabelEmpty ? 'img' : undefined,
            'aria-label': !isLabelEmpty ? props.label : undefined,
            'aria-hidden': isLabelEmpty
        };

        return ObjectUtils.getMergedProps(otherProps, ptiProps);
    }
}
