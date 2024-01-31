import {Cartesian} from "@/utils/type-utils";

export type Dimension = {
    width: number,
    height: number,
};

export type ViewportSize = Dimension;

export type UpperLeftCornerOffset = {
    top: string,
    left: string,
};

type Axis = "x" | "y";

type XOffset = "left" | "right" | undefined;
type YOffset = "top" | "bottom" | undefined;

export type CenterOffset = Cartesian<XOffset, "center", false, true> | Cartesian<YOffset, "center", false, true>;
export type SingleCenterOffset = "center";

export type Offset = Cartesian<XOffset, YOffset, false, true> | CenterOffset;
export type Position = Cartesian<XOffset, YOffset, true> | SingleCenterOffset;

export class DomHandler {
    private static calculatedScrollbarWidth: number | null = null;

    /**
     * All data- properties like data-test-id
     */
    static DATA_PROPS = ['data-'];
    /**
     * All ARIA properties like aria-label and focus-target for https://www.npmjs.com/package/@q42/floating-focus-a11y
     */
    static ARIA_PROPS = ['aria', 'focus-target'];

    static innerWidth(el: HTMLElement): number {
        if (el) {
            let width = el.offsetWidth;
            let style = getComputedStyle(el);

            width += parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

            return width;
        }

        return 0;
    }

    static width(el: HTMLElement): number {
        if (el) {
            let width = el.offsetWidth;
            let style = getComputedStyle(el);

            width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

            return width;
        }

        return 0;
    }

    static getWindowScrollTop(): number {
        let doc = document.documentElement;

        return (window.scrollY || doc.scrollTop) - (doc.clientTop || 0);
    }

    static getWindowScrollLeft(): number {
        let doc = document.documentElement;

        return (window.scrollX || doc.scrollLeft) - (doc.clientLeft || 0);
    }

    static getOuterWidth(el?: HTMLElement | null, margin?: boolean): number {
        if (el) {
            let width = el.getBoundingClientRect().width || el.offsetWidth;

            if (margin) {
                let style = getComputedStyle(el);

                width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            }

            return width;
        }

        return 0;
    }

    static getOuterHeight(el?: HTMLElement | null, margin?: boolean): number {
        if (el) {
            let height = el.getBoundingClientRect().height || el.offsetHeight;

            if (margin) {
                let style = getComputedStyle(el);

                height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            }

            return height;
        }

        return 0;
    }

    static getClientHeight(el?: HTMLElement | null, margin?: boolean): number {
        if (el) {
            let height = el.clientHeight;

            if (margin) {
                let style = getComputedStyle(el);

                height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            }

            return height;
        }

        return 0;
    }

    static getClientWidth(el?: HTMLElement | null, margin?: boolean): number {
        if (el) {
            let width = el.clientWidth;

            if (margin) {
                let style = getComputedStyle(el);

                width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            }

            return width;
        }

        return 0;
    }

    static getViewport(): ViewportSize {
        let win = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            w = win.innerWidth || e.clientWidth || g.clientWidth,
            h = win.innerHeight || e.clientHeight || g.clientHeight;

        return { width: w, height: h };
    }

    static getOffset(el: HTMLElement): UpperLeftCornerOffset {
        if (el) {
            let rect = el.getBoundingClientRect();

            return {
                top: `${rect.top + (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0)}`,
                left: `${rect.left + (window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0)}`
            };
        }

        return {
            top: 'auto',
            left: 'auto'
        };
    }

    static index(el: HTMLElement): number {
        if (el && el.parentNode) {
            let children = el.parentNode.childNodes;
            let num = 0;

            for (let i = 0; i < children.length; i++) {
                if (children[i] === el) return num;
                if (children[i].nodeType === 1) num++;
            }
        }

        return -1;
    }

    static addMultipleClasses(el: HTMLElement, className: string): void {
        if (el && className) {
            if (el.classList) {
                let styles = className.split(' ');

                for (let i = 0; i < styles.length; i++) {
                    el.classList.add(styles[i]);
                }
            } else {
                let styles = className.split(' ');

                for (let i = 0; i < styles.length; i++) {
                    el.className += ' ' + styles[i];
                }
            }
        }
    }

    static removeMultipleClasses(el: HTMLElement, className: string): void {
        if (el && className) {
            if (el.classList) {
                let styles = className.split(' ');

                for (let i = 0; i < styles.length; i++) {
                    el.classList.remove(styles[i]);
                }
            } else {
                let styles = className.split(' ');

                for (let i = 0; i < styles.length; i++) {
                    el.className = el.className.replace(new RegExp('(^|\\b)' + styles[i].split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            }
        }
    }

    static addClass(el: HTMLElement, className: string): void {
        if (el && className) {
            if (el.classList) el.classList.add(className);
            else el.className += ' ' + className;
        }
    }

    static removeClass(el: HTMLElement, className: string): void {
        if (el && className) {
            if (el.classList) el.classList.remove(className);
            else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    static hasClass(el: HTMLElement, className: string): boolean {
        if (el) {
            if (el.classList) return el.classList.contains(className);
            else return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }

        return false;
    }

    static addStyles(el: HTMLElement, styles: CSSStyleDeclaration): void {
        if (el) {
            Object.entries(styles).forEach(([key, value]) => (el.style.setProperty(key, value)));
        }
    }

    static find(el: HTMLElement, selector: string): Element[] {
        return el ? Array.from(el.querySelectorAll(selector)) : [];
    }

    static findSingle(el: HTMLElement, selector: string): Element | null {
        return el ? el.querySelector(selector) : null;
    }

    // TODO: fix error: $attrs does not exist in HTMLElement
    // static setAttributes(el: HTMLElement, attributes: object = {}): void {
    //     if (el) {
    //         const computedStyles = (rule, value) => {
    //             const styles = el?.classList.$attrs?.[rule] ? [el?.$attrs?.[rule]] : [];
    //
    //             return [value].flat().reduce((cv, v) => {
    //                 if (v !== null && v !== undefined) {
    //                     const type = typeof v;
    //
    //                     if (type === 'string' || type === 'number') {
    //                         cv.push(v);
    //                     } else if (type === 'object') {
    //                         const _cv = Array.isArray(v)
    //                             ? computedStyles(rule, v)
    //                             : Object.entries(v).map(([_k, _v]) => (rule === 'style' && (!!_v || _v === 0) ? `${_k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}:${_v}` : !!_v ? _k : undefined));
    //
    //                         cv = _cv.length ? cv.concat(_cv.filter((c) => !!c)) : cv;
    //                     }
    //                 }
    //
    //                 return cv;
    //             }, styles);
    //         };
    //
    //         Object.entries(attributes).forEach(([key, value]) => {
    //             if (value !== undefined && value !== null) {
    //                 const matchedEvent = key.match(/^on(.+)/);
    //
    //                 if (matchedEvent) {
    //                     el.addEventListener(matchedEvent[1].toLowerCase(), value);
    //                 } else if (key === 'p-bind') {
    //                     this.setAttributes(el, value);
    //                 } else {
    //                     value = key === 'class' ? [...new Set(computedStyles('class', value))].join(' ').trim() : key === 'style' ? computedStyles('style', value).join(';').trim() : value;
    //                     (el.$attrs = el.$attrs || {}) && (el.$attrs[key] = value);
    //                     el.setAttribute(key, value);
    //                 }
    //             }
    //         });
    //     }
    // }
    //
    // static getAttribute(el: HTMLElement, name: string): any {
    //     if (el) {
    //         const value = el.getAttribute(name);
    //
    //         if (!isNaN(value)) {
    //             return +value;
    //         }
    //
    //         if (value === 'true' || value === 'false') {
    //             return value === 'true';
    //         }
    //
    //         return value;
    //     }
    //
    //     return undefined;
    // }
    //
    // static isAttributeEquals(el: HTMLElement, name: string, value: any): boolean {
    //     return el ? this.getAttribute(el, name) === value : false;
    // }

    static getHeight(el: HTMLElement): number {
        if (el) {
            let height = el.offsetHeight;
            let style = getComputedStyle(el);

            height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

            return height;
        }

        return 0;
    }

    static getWidth(el: HTMLElement): number {
        if (el) {
            let width = el.offsetWidth;
            let style = getComputedStyle(el);

            width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width;
        }

        return 0;
    }

    static alignOverlay(overlay: HTMLElement, target: HTMLElement, appendTo?: string, calculateMinWidth = true): void {
        if (overlay && target) {
            if (appendTo === 'self') {
                this.relativePosition(overlay, target);
            } else {
                calculateMinWidth && (overlay.style.minWidth = DomHandler.getOuterWidth(target) + 'px');
                this.absolutePosition(overlay, target);
            }
        }
    }

    static absolutePosition(el: HTMLElement, target: HTMLElement, align = 'left'): void {
        if (el && target) {
            let elementDimensions = el.offsetParent ? { width: el.offsetWidth, height: el.offsetHeight } : this.getHiddenElementDimensions(el);
            let elementOuterHeight = elementDimensions.height ? elementDimensions.height : 0;
            let elementOuterWidth = elementDimensions.width ? elementDimensions.width : 0;
            let targetOuterHeight = target.offsetHeight;
            let targetOuterWidth = target.offsetWidth;
            let targetOffset = target.getBoundingClientRect();
            let windowScrollTop = this.getWindowScrollTop();
            let windowScrollLeft = this.getWindowScrollLeft();
            let viewport = this.getViewport();
            let top, left;

            if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
                top = targetOffset.top + windowScrollTop - elementOuterHeight;

                if (top < 0) {
                    top = windowScrollTop;
                }

                el.style.transformOrigin = 'bottom';
            } else {
                top = targetOuterHeight + targetOffset.top + windowScrollTop;
                el.style.transformOrigin = 'top';
            }

            const targetOffsetPx = targetOffset.left;
            const alignOffset = align === 'left' ? 0 : elementOuterWidth - targetOuterWidth;

            if (targetOffsetPx + targetOuterWidth + elementOuterWidth > viewport.width) left = Math.max(0, targetOffsetPx + windowScrollLeft + targetOuterWidth - elementOuterWidth);
            else left = targetOffsetPx - alignOffset + windowScrollLeft;

            el.style.top = top + 'px';
            el.style.left = left + 'px';
        }
    }

    static relativePosition(el: HTMLElement, target: HTMLElement): void {
        if (el && target) {
            let elementDimensions = el.offsetParent ? { width: el.offsetWidth, height: el.offsetHeight } : this.getHiddenElementDimensions(el);
            const elementDimensionsHeight = elementDimensions.height ? elementDimensions.height : 0;
            const elementDimensionsWidth = elementDimensions.width ? elementDimensions.width : 0;
            const targetHeight = target.offsetHeight;
            const targetOffset = target.getBoundingClientRect();
            const viewport = this.getViewport();
            let top, left;

            if (targetOffset.top + targetHeight + elementDimensionsHeight > viewport.height) {
                top = -1 * elementDimensionsHeight;

                if (targetOffset.top + top < 0) {
                    top = -1 * targetOffset.top;
                }

                el.style.transformOrigin = 'bottom';
            } else {
                top = targetHeight;
                el.style.transformOrigin = 'top';
            }

            if (elementDimensionsWidth > viewport.width) {
                // element wider then viewport and cannot fit on screen (align at left side of viewport)
                left = targetOffset.left * -1;
            } else if (targetOffset.left + elementDimensionsWidth > viewport.width) {
                // element wider then viewport but can be fit on screen (align at right side of viewport)
                left = (targetOffset.left + elementDimensionsWidth - viewport.width) * -1;
            } else {
                // element fits on screen (align with target)
                left = 0;
            }

            el.style.top = top + 'px';
            el.style.left = left + 'px';
        }
    }

    static flipfitCollision(el: HTMLElement, target: HTMLElement, callback?: any, my: Offset ='left top', at: Offset = 'left bottom'): void {
        if (el && target) {
            const targetOffset = target.getBoundingClientRect();
            const viewport = this.getViewport();
            const myArr = my.split(" ") as Position[];
            const atArr = at.split(" ") as Position[];

            const getPositionOffset = (arr: string) => (+arr.substring(arr.search(/([+\-])/g)) || 0)

            const position = {
                my: {
                    x: myArr[0],
                    y: myArr[1] || myArr[0],
                    offsetX: getPositionOffset(myArr[0]),
                    offsetY: getPositionOffset(myArr[1] || myArr[0])
                },
                at: {
                    x: atArr[0],
                    y: atArr[1] || atArr[0],
                    offsetX: getPositionOffset(atArr[0]),
                    offsetY: getPositionOffset(atArr[1] || atArr[0])
                }
            };
            const myOffset = {
                left: () => {
                    const totalOffset = position.my.offsetX + position.at.offsetX;

                    return totalOffset + targetOffset.left + (position.my.x === 'left' ? 0 : -1 * (position.my.x === 'center' ? this.getOuterWidth(el) / 2 : this.getOuterWidth(el)));
                },
                top: () => {
                    const totalOffset = position.my.offsetY + position.at.offsetY;

                    return totalOffset + targetOffset.top + (position.my.y === 'top' ? 0 : -1 * (position.my.y === 'center' ? this.getOuterHeight(el) / 2 : this.getOuterHeight(el)));
                }
            };
            const alignWithAt = {
                count: {
                    x: 0,
                    y: 0
                },
                left: function () {
                    const left = myOffset.left();
                    const scrollLeft = DomHandler.getWindowScrollLeft();

                    el.style.left = left + scrollLeft + 'px';

                    if (this.count.x === 2) {
                        el.style.left = scrollLeft + 'px';
                        this.count.x = 0;
                    } else if (left < 0) {
                        this.count.x++;
                        position.my.x = 'left';
                        position.at.x = 'right';
                        position.my.offsetX *= -1;
                        position.at.offsetX *= -1;

                        this.right();
                    }
                },
                right: function () {
                    const left = myOffset.left() + DomHandler.getOuterWidth(target);
                    const scrollLeft = DomHandler.getWindowScrollLeft();

                    el.style.left = left + scrollLeft + 'px';

                    if (this.count.x === 2) {
                        el.style.left = viewport.width - DomHandler.getOuterWidth(el) + scrollLeft + 'px';
                        this.count.x = 0;
                    } else if (left + DomHandler.getOuterWidth(el) > viewport.width) {
                        this.count.x++;

                        position.my.x = 'right';
                        position.at.x = 'left';
                        position.my.offsetX *= -1;
                        position.at.offsetX *= -1;

                        this.left();
                    }
                },
                top: function () {
                    const top = myOffset.top();
                    const scrollTop = DomHandler.getWindowScrollTop();

                    el.style.top = top + scrollTop + 'px';

                    if (this.count.y === 2) {
                        el.style.left = scrollTop + 'px';
                        this.count.y = 0;
                    } else if (top < 0) {
                        this.count.y++;

                        position.my.y = 'top';
                        position.at.y = 'bottom';
                        position.my.offsetY *= -1;
                        position.at.offsetY *= -1;

                        this.bottom();
                    }
                },
                bottom: function () {
                    const top = myOffset.top() + DomHandler.getOuterHeight(target);
                    const scrollTop = DomHandler.getWindowScrollTop();

                    el.style.top = top + scrollTop + 'px';

                    if (this.count.y === 2) {
                        el.style.left = viewport.height - DomHandler.getOuterHeight(el) + scrollTop + 'px';
                        this.count.y = 0;
                    } else if (top + DomHandler.getOuterHeight(target) > viewport.height) {
                        this.count.y++;

                        position.my.y = 'bottom';
                        position.at.y = 'top';
                        position.my.offsetY *= -1;
                        position.at.offsetY *= -1;

                        this.top();
                    }
                },
                center: function (axis: Axis) {
                    if (axis === 'y') {
                        const top = myOffset.top() + DomHandler.getOuterHeight(target) / 2;

                        el.style.top = top + DomHandler.getWindowScrollTop() + 'px';

                        if (top < 0) {
                            this.bottom();
                        } else if (top + DomHandler.getOuterHeight(target) > viewport.height) {
                            this.top();
                        }
                    } else {
                        const left = myOffset.left() + DomHandler.getOuterWidth(target) / 2;

                        el.style.left = left + DomHandler.getWindowScrollLeft() + 'px';

                        if (left < 0) {
                            this.left();
                        } else if (left + DomHandler.getOuterWidth(el) > viewport.width) {
                            this.right();
                        }
                    }
                }
            };

            alignWithAt[position.at.x]('x');
            alignWithAt[position.at.y]('y');

            if (this.isFunction(callback)) {
                callback(position);
            }
        }
    }

    static findCollisionPosition(position: Exclude<Position, "center">): {axis: Axis, my: Offset, at: Offset} {
        const isAxisY = position === 'top' || position === 'bottom';
        const myXPosition: XOffset = position === 'left' ? 'right' : 'left';
        const myYPosition: YOffset = position === 'top' ? 'bottom' : 'top';

        if (isAxisY) {
            return {
                axis: 'y',
                my: `center ${myYPosition}`,
                at: `center ${position}`
            };
        }

        return {
            axis: 'x',
            my: `${myXPosition} center`,
            at: `${position} center`
        };
    }

    static getParents(el: HTMLElement, parents: HTMLElement[] = []): HTMLElement[] {
        return el['parentNode'] === null ? parents : this.getParents(el.parentNode as HTMLElement, parents.concat([el.parentNode as HTMLElement]));
    }

    static getScrollableParents(el: HTMLElement, hideOverlaysOnDocumentScrolling?: boolean): Node[] {
        let scrollableParents: EventTarget[] = [];

        if (el) {
            let parents = this.getParents(el);
            const overflowRegex = /(auto|scroll)/;

            const overflowCheck = (node: Element) => {
                let styleDeclaration = node ? getComputedStyle(node) : null;

                return (
                    styleDeclaration && (overflowRegex.test(styleDeclaration.getPropertyValue('overflow')) || overflowRegex.test(styleDeclaration.getPropertyValue('overflowX')) || overflowRegex.test(styleDeclaration.getPropertyValue('overflowY')))
                );
            };

            const addScrollableParent = (node: Element) => {
                if (hideOverlaysOnDocumentScrolling) {
                    // nodeType 9 is for document element
                    scrollableParents.push(node.nodeName === 'BODY' || node.nodeName === 'HTML' || node.nodeType === 9 ? window : node);
                } else {
                    scrollableParents.push(node);
                }
            };

            for (let parent of parents) {
                let scrollSelectors = parent.nodeType === 1 && parent.dataset['scrollselectors'];

                if (scrollSelectors) {
                    let selectors = scrollSelectors.split(',');

                    for (let selector of selectors) {
                        let el = this.findSingle(parent, selector);

                        if (el && overflowCheck(el)) {
                            addScrollableParent(el);
                        }
                    }
                }

                // BODY
                if (parent.nodeType === 1 && overflowCheck(parent)) {
                    addScrollableParent(parent);
                }
            }
        }

        // we should always at least have the body or window
        if (!scrollableParents.some((node) => node === document.body || node === window)) {
            scrollableParents.push(window);
        }

        return scrollableParents as Node[];
    }

    static getHiddenElementOuterHeight(el: HTMLElement): number {
        if (el) {
            el.style.visibility = 'hidden';
            el.style.display = 'block';
            let elementHeight = el.offsetHeight;

            el.style.display = 'none';
            el.style.visibility = 'visible';

            return elementHeight;
        }

        return 0;
    }

    static getHiddenElementOuterWidth(el: HTMLElement): number {
        if (el) {
            el.style.visibility = 'hidden';
            el.style.display = 'block';
            let elementWidth = el.offsetWidth;

            el.style.display = 'none';
            el.style.visibility = 'visible';

            return elementWidth;
        }

        return 0;
    }

    static getHiddenElementDimensions(el: HTMLElement): Dimension {
        let dimensions: Dimension = { width: 0, height: 0 };

        el.style.visibility = 'hidden';
        el.style.display = 'block';
        dimensions.width = el.offsetWidth;
        dimensions.height = el.offsetHeight;
        el.style.display = 'none';
        el.style.visibility = 'visible';

        return dimensions;
    }

    static fadeIn(el: HTMLElement, duration: number): void {
        if (el) {
            el.style.setProperty('opacity', "0");

            let last = +new Date();
            let opacity = 0;

            let tick = function () {
                opacity = +el.style.opacity + (new Date().getTime() - last) / duration;
                el.style.setProperty('opacity', String(opacity));
                last = +new Date();

                if (+opacity < 1) {
                    (requestAnimationFrame(tick)) || setTimeout(tick, 16);
                }
            };

            tick();
        }
    }

    static fadeOut(el: HTMLElement, duration: number): void {
        if (el) {
            let opacity = 1,
                interval = 50,
                gap = interval / duration;

            let fading = setInterval(() => {
                opacity -= gap;

                if (opacity <= 0) {
                    opacity = 0;
                    clearInterval(fading);
                }

                el.style.setProperty('opacity', String(opacity));
            }, interval);
        }
    }

    static isFunction(obj: any): boolean {
        return !!(obj && obj.constructor && obj.call && obj.apply) && typeof obj === 'function';
    }

    static isElement(obj: any): boolean {
        return typeof HTMLElement === 'object' ? obj instanceof HTMLElement : obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
    }

    static appendChild(el: HTMLElement, target: HTMLElement): void {
        if (this.isElement(target)) target.appendChild(el);
        // else if (target && target.el.nativeElement) target.el.nativeElement.appendChild(el); // TODO: is really needed
        else throw new Error('Cannot append ' + target + ' to ' + el);
    }

    static removeChild(el: HTMLElement, target: HTMLElement): void {
        if (this.isElement(target)) target.removeChild(el);
        // else if (target.el && target.el.nativeElement) target.el.nativeElement.removeChild(el); // TODO: is really needed
        else throw new Error('Cannot remove ' + el + ' from ' + target);
    }

    static scrollInView(container: HTMLElement, item: HTMLElement): void {
        let borderTopValue = getComputedStyle(container).getPropertyValue('borderTopWidth');
        let borderTop = borderTopValue ? parseFloat(borderTopValue) : 0;
        let paddingTopValue = getComputedStyle(container).getPropertyValue('paddingTop');
        let paddingTop = paddingTopValue ? parseFloat(paddingTopValue) : 0;
        let containerRect = container.getBoundingClientRect();
        let itemRect = item.getBoundingClientRect();
        let offset = itemRect.top + document.body.scrollTop - (containerRect.top + document.body.scrollTop) - borderTop - paddingTop;
        let scroll = container.scrollTop;
        let elementHeight = container.clientHeight;
        let itemHeight = this.getOuterHeight(item);

        if (offset < 0) {
            container.scrollTop = scroll + offset;
        } else if (offset + itemHeight > elementHeight) {
            container.scrollTop = scroll + offset - elementHeight + itemHeight;
        }
    }

    static clearSelection(): void {
        let selection = window.getSelection();
        if (selection) {
            if (selection.empty) {
                selection.empty();
            } else if (selection.rangeCount > 0 && selection.getRangeAt(0).getClientRects().length > 0) {
                selection.removeAllRanges();
            }
        } else {
            selection = document.getSelection();
            if (selection) {
                try {
                    selection.empty();
                } catch (error) {
                    //ignore IE bug
                }
            }
        }
    }

    static calculateScrollbarWidth(el: HTMLElement): number {
        if (el) {
            let style = getComputedStyle(el);

            return el.offsetWidth - el.clientWidth - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
        } else {
            if (this.calculatedScrollbarWidth != null) return this.calculatedScrollbarWidth;

            let scrollDiv = document.createElement('div');

            scrollDiv.className = 'p-scrollbar-measure';
            document.body.appendChild(scrollDiv);

            let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

            document.body.removeChild(scrollDiv);

            this.calculatedScrollbarWidth = scrollbarWidth;

            return scrollbarWidth;
        }
    }

    static calculateBodyScrollbarWidth(): number {
        return window.innerWidth - document.documentElement.offsetWidth;
    }

    static blockBodyScroll(className = 'p-overflow-hidden') {
        /*
         * @todo This method is called several times after this PR. Refactors will be made to prevent this in future releases.
         */
        const hasScrollbarWidth = !!document.body.style.getPropertyValue('--scrollbar-width');

        !hasScrollbarWidth && document.body.style.setProperty('--scrollbar-width', this.calculateBodyScrollbarWidth() + 'px');
        this.addClass(document.body, className);
    }

    static unblockBodyScroll(className = 'p-overflow-hidden') {
        document.body.style.removeProperty('--scrollbar-width');
        this.removeClass(document.body, className);
    }

    static isVisible(el: HTMLElement): boolean {
        // https://stackoverflow.com/a/59096915/502366 (in future test IntersectionObserver)
        let isVisible = false;
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            observer.disconnect();
        });

        observer.observe(el);

        return el && (el.clientHeight !== 0 || el.getClientRects().length !== 0 || getComputedStyle(el).display !== 'none' || isVisible);
    }

    static isExist(el: HTMLElement): boolean {
        return !!(el !== null && typeof el !== 'undefined' && el.nodeName && el.parentNode);
    }

    static getFocusableElements(el: HTMLElement, selector = ''): Element[] {
        let focusableElements = DomHandler.find(
            el,
            `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector},
                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${selector}`
        );

        let visibleFocusableElements: Element[] = [];

        focusableElements.forEach(elem => {
            if (getComputedStyle(elem).display !== 'none' && getComputedStyle(elem).visibility !== 'hidden') {
                visibleFocusableElements.push(elem);
            }
        });

        return visibleFocusableElements;
    }

    static getFirstFocusableElement(el: HTMLElement, selector?: string): Element | null {
        const focusableElements = DomHandler.getFocusableElements(el, selector);

        return focusableElements.length > 0 ? focusableElements[0] : null;
    }

    static getLastFocusableElement(el: HTMLElement, selector?: string): Element | null {
        const focusableElements = DomHandler.getFocusableElements(el, selector);

        return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null;
    }

    /**
     * Focus an input element if it does not already have focus.
     *
     * @param {HTMLElement} el a HTML element
     * @param {boolean} scrollTo flag to control whether to scroll to the element, false by default
     */
    static focus(el: HTMLElement, scrollTo?: boolean): void {
        const preventScroll = scrollTo === undefined ? true : !scrollTo;

        el && document.activeElement !== el && el.focus({ preventScroll });
    }

    static getCursorOffset(el: HTMLElement, prevText: string, nextText: string, currentText: string): UpperLeftCornerOffset {
        if (el) {
            let style = getComputedStyle(el);
            let ghostDiv = document.createElement('div');

            ghostDiv.style.position = 'absolute';
            ghostDiv.style.top = '0px';
            ghostDiv.style.left = '0px';
            ghostDiv.style.visibility = 'hidden';
            ghostDiv.style.pointerEvents = 'none';
            ghostDiv.style.overflow = style.overflow;
            ghostDiv.style.width = style.width;
            ghostDiv.style.height = style.height;
            ghostDiv.style.padding = style.padding;
            ghostDiv.style.border = style.border;
            ghostDiv.style.overflowWrap = style.overflowWrap;
            ghostDiv.style.whiteSpace = style.whiteSpace;
            ghostDiv.style.lineHeight = style.lineHeight;
            ghostDiv.innerHTML = prevText.replace(/\r\n|\r|\n/g, '<br />');

            let ghostSpan = document.createElement('span');

            ghostSpan.textContent = currentText;
            ghostDiv.appendChild(ghostSpan);

            let text = document.createTextNode(nextText);

            ghostDiv.appendChild(text);
            document.body.appendChild(ghostDiv);

            const { offsetLeft, offsetTop, clientHeight } = ghostSpan;

            document.body.removeChild(ghostDiv);

            return {
                top: String(Math.abs(offsetTop - el.scrollTop) + clientHeight),
                left: String(Math.abs(offsetLeft - el.scrollLeft))
            };
        }

        return {
            top: 'auto',
            left: 'auto'
        };
    }

    static isClickable(el: HTMLElement): boolean {
        const targetNode = el.nodeName;
        if (el.parentElement) {
            const parentNode = el.parentElement && el.parentElement.nodeName;

            return (
                targetNode === 'INPUT' ||
                targetNode === 'TEXTAREA' ||
                targetNode === 'BUTTON' ||
                targetNode === 'A' ||
                parentNode === 'INPUT' ||
                parentNode === 'TEXTAREA' ||
                parentNode === 'BUTTON' ||
                parentNode === 'A' ||
                this.hasClass(el, 'p-button') ||
                this.hasClass(el.parentElement, 'p-button') ||
                this.hasClass(el.parentElement, 'p-checkbox') ||
                this.hasClass(el.parentElement, 'p-radiobutton')
            );
        }

        return false;
    }

    static applyStyle(el: HTMLElement, style: CSSStyleDeclaration | string): void {
        if (typeof style === 'string') {
            el.style.cssText = style;
        } else {
            for (let prop in style) {
                el.style[prop] = style[prop];
            }
        }
    }

    // TODO: Does really needed?
    // static exportCSV(csv: any, filename: string): void {
    //     let blob = new Blob([csv], {
    //         type: 'application/csv;charset=utf-8;'
    //     });
    //
    //     if (window.navigator.msSaveOrOpenBlob) {
    //         navigator.msSaveOrOpenBlob(blob, filename + '.csv');
    //     } else {
    //         const isDownloaded = DomHandler.saveAs({ name: filename + '.csv', src: URL.createObjectURL(blob) });
    //
    //         if (!isDownloaded) {
    //             csv = 'data:text/csv;charset=utf-8,' + csv;
    //             window.open(encodeURI(csv));
    //         }
    //     }
    // }
    //
    // static saveAs(file: { name: string; url: any }): boolean {
    //     if (file) {
    //         let link = document.createElement('a');
    //
    //         if (link.download !== undefined) {
    //             const { name, url } = file;
    //
    //             link.setAttribute('href', url);
    //             link.setAttribute('download', name);
    //             link.style.display = 'none';
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //
    //             return true;
    //         }
    //     }
    //
    //     return false;
    // }

    static createInlineStyle(nonce?: string, styleContainer?: ShadowRoot | HTMLElement): HTMLStyleElement {
        let styleElement = document.createElement('style');

        DomHandler.addNonce(styleElement, nonce);

        if (!styleContainer) {
            styleContainer = document.head;
        }

        styleContainer.appendChild(styleElement);

        return styleElement;
    }

    static removeInlineStyle(styleElement: HTMLStyleElement): HTMLStyleElement | null {
        if (this.isExist(styleElement) && styleElement.parentNode) {
            try {
                styleElement.parentNode.removeChild(styleElement);
            } catch (error) {
                // style element may have already been removed in a fast refresh
            }

            return null;
        }

        return styleElement;
    }

    static addNonce(styleElement: HTMLStyleElement, nonce?: string) {
        try {
            if (!nonce) {
                nonce = process.env.REACT_APP_CSS_NONCE;
            }
        } catch (error) {
            // NOOP
        }

        nonce && styleElement.setAttribute('nonce', nonce);
    }

    static getTargetElement(target: 'document' | 'window' | { current?: any } | Function): HTMLElement | Document | Window | null {
        if (!target) return null;

        if (target === 'document') {
            return document;
        } else if (target === 'window') {
            return window;
        } else if (typeof target === 'object' && target.hasOwnProperty('current')) {
            return this.isExist(target.current) ? target.current : null;
        } else {
            const element = this.isFunction(target) && typeof target === 'function' ? target() : target;

            return (element && element.nodeType === 9) || this.isExist(element) ? element : null;
        }
    }

    /**
     * Get the attribute names for an element and sorts them alpha for comparison
     */
    static getAttributeNames(node: HTMLElement) {
        let index, rv, attrs;

        rv = [];
        attrs = node.attributes;

        for (index = 0; index < attrs.length; ++index) {
            rv.push(attrs[index].nodeName);
        }

        rv.sort();

        return rv;
    }

    /**
     * Compare two elements for equality.  Even will compare if the style element
     * is out of order for example:
     *
     * elem1 = style="color: red; font-size: 28px"
     * elem2 = style="font-size: 28px; color: red"
     */
    static isEqualElement(elm1: HTMLElement, elm2: HTMLElement) {
        let attrs1, attrs2, name, node1, node2;

        // Compare attributes without order sensitivity
        attrs1 = DomHandler.getAttributeNames(elm1);
        attrs2 = DomHandler.getAttributeNames(elm2);

        if (attrs1.join(',') !== attrs2.join(',')) {
            // console.log("Found nodes with different sets of attributes; not equiv");
            return false;
        }

        // ...and values
        // unless you want to compare DOM0 event handlers
        // (onclick="...")
        for (let index = 0; index < attrs1.length; ++index) {
            name = attrs1[index];

            if (name === 'style') {
                const astyle = elm1.style;
                const bstyle = elm2.style;
                const rexDigitsOnly = /^\d+$/;

                for (const key of Object.keys(astyle)) {
                    if (!rexDigitsOnly.test(key) && astyle.getPropertyValue(key) !== bstyle.getPropertyValue(key)) {
                        // Not equivalent, stop
                        //console.log("Found nodes with mis-matched values for attribute '" + name + "'; not equiv");
                        return false;
                    }
                }
            } else {
                if (elm1.getAttribute(name) !== elm2.getAttribute(name)) {
                    // console.log("Found nodes with mis-matched values for attribute '" + name + "'; not equiv");
                    return false;
                }
            }
        }

        // Walk the children
        for (node1 = elm1.firstChild, node2 = elm2.firstChild; node1 && node2; node1 = node1.nextSibling, node2 = node2.nextSibling) {
            if (node1.nodeType !== node2.nodeType) {
                // display("Found nodes of different types; not equiv");
                return false;
            }

            if (node1.nodeType === 1) {
                // Element
                if (!DomHandler.isEqualElement(node1 as HTMLElement, node2 as HTMLElement)) {
                    return false;
                }
            } else if (node1.nodeValue !== node2.nodeValue) {
                // console.log("Found nodes with mis-matched nodeValues; not equiv");
                return false;
            }
        }

        if (node1 || node2) {
            // One of the elements had more nodes than the other
            // console.log("Found more children of one element than the other; not equivalent");
            return false;
        }

        // Seem the same
        return true;
    }
}
