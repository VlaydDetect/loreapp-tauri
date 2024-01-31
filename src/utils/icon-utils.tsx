import React from 'react';
import {classNames} from './utils';
import {ObjectUtils} from './object-utils';

/**
 * Icon options passed to any icon.
 * ComponentProps are props from the owning component.
 * AdditionalProps are any custom properties of an icon like SortIcon of the Datatable for example.
 */
export type IconOptions<ComponentProps, AdditionalProps> = AdditionalProps & {
    /**
     * Icon specific properties.
     */
    iconProps: React.HTMLProps<any> | React.SVGProps<any>;
    /**
     * The element representing the icon.
     */
    element: React.ReactNode;
    /**
     * Properties of the owning component.
     */
    props?: ComponentProps;
    [key: string]: any;
};

export type IconType<ComponentProps, AdditionalProps = NonNullable<unknown>> = React.ReactNode | ((options: IconOptions<ComponentProps, AdditionalProps>) => React.ReactNode);

export class IconUtils {
    static getJSXIcon(icon: IconType<any>, iconProps: React.HTMLProps<HTMLElement> = {}, options: any = {}): any {
        let content = null;

        if (icon !== null) {
            const iconType = typeof icon;
            const className = classNames(iconProps.className, iconType === 'string' && icon);

            content = <span {...iconProps} className={className}></span>;

            if (iconType !== 'string') {
                const defaultContentOptions = {
                    iconProps: iconProps,
                    element: content,
                    ...options
                };

                return ObjectUtils.getJSXElement(icon, defaultContentOptions);
            }
        }

        return content;
    }
}
