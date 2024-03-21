export class ObjectUtils {
    static equals(obj1: any, obj2: any, field: string): boolean {
        if (field && obj1 && typeof obj1 === 'object' && obj2 && typeof obj2 === 'object') {
            return this.deepEquals(
                this.resolveFieldData(obj1, field),
                this.resolveFieldData(obj2, field),
            );
        }

        return this.deepEquals(obj1, obj2);
    }

    /**
     * Compares two JSON objects for deep equality recursively comparing both objects.
     * @param {*} a the first JSON object
     * @param {*} b the second JSON object
     * @returns true if equals, false it not
     */
    static deepEquals(a: any, b: any): boolean {
        if (a === b) return true;

        if (a && b && typeof a === 'object' && typeof b === 'object') {
            const arrA = Array.isArray(a);
            const arrB = Array.isArray(b);

            let i, length, key;

            if (arrA && arrB) {
                length = a.length;
                if (length !== b.length) return false;
                for (i = length; i-- !== 0; ) if (!this.deepEquals(a[i], b[i])) return false;

                return true;
            }

            if (arrA !== arrB) return false;

            const dateA = a instanceof Date;
            const dateB = b instanceof Date;

            if (dateA !== dateB) return false;
            if (dateA && dateB) return a.getTime() === b.getTime();

            const regexpA = a instanceof RegExp;
            const regexpB = b instanceof RegExp;

            if (regexpA !== regexpB) return false;
            if (regexpA && regexpB) return a.toString() === b.toString();

            const keys = Object.keys(a);

            length = keys.length;

            if (length !== Object.keys(b).length) return false;

            for (i = length; i-- !== 0; )
                if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

            for (i = length; i-- !== 0; ) {
                key = keys[i];
                if (!this.deepEquals(a[key], b[key])) return false;
            }

            return true;
        }

        // eslint-disable-next-line no-self-compare
        return a !== a && b !== b;
    }

    // Ref: https://github.com/primefaces/primereact/blob/master/components/lib/utils/utils.d.ts
    static resolveFieldData(data: any, field: string): any {
        if (!data || !field) {
            // short circuit if there is nothing to resolve
            return null;
        }

        try {
            const value = data[field];

            if (this.isNotEmpty(value)) return value;
        } catch {
            // Performance optimization: https://github.com/primefaces/primereact/issues/4797
            // do nothing and continue to other methods to resolve field data
        }

        if (Object.keys(data).length) {
            if (this.isNotEmpty(data[field])) {
                return data[field];
            }
            if (field.indexOf('.') === -1) {
                return data[field];
            }

            const fields = field.split('.');
            let value = data;

            // eslint-disable-next-line no-restricted-syntax
            for (const iField of fields) {
                if (value === null) {
                    return null;
                }

                value = value[iField];
            }

            return value;
        }

        return null;
    }

    static findDiffKeys(obj1: any, obj2: any): object {
        if (!obj1 || !obj2) {
            return {};
        }

        return Object.keys(obj1)
            .filter(key => !Object.prototype.hasOwnProperty.call(obj2, key))
            .reduce((result, current) => {
                // @ts-ignore
                result[current] = obj1[current];

                return result;
            }, {});
    }

    /**
     * Removes keys from a JSON object that start with a string such as "data" to get all "data-id" type properties.
     *
     * @param {any} obj the JSON object to reduce
     * @param {string[]} startsWiths the string(s) to check if the property starts with this key
     * @returns the JSON object containing only the key/values that match the startsWith string
     */
    static reduceKeys(obj: any, startsWiths: string[]) {
        const result = {};

        if (!obj || !startsWiths || startsWiths.length === 0) {
            return result;
        }

        Object.keys(obj)
            .filter(key => startsWiths.some(value => key.startsWith(value)))
            .forEach(key => {
                // @ts-ignore
                result[key] = obj[key];
                delete obj[key];
            });

        return result;
    }

    static reorderArray(value: any, from: number, to: number): void {
        if (value && from !== to) {
            if (to >= value.length) {
                to %= value.length;
                from %= value.length;
            }

            value.splice(to, 0, value.splice(from, 1)[0]);
        }
    }

    static findIndexInList(value: any, list: any[], dataKey?: string): number {
        if (list) {
            return dataKey
                ? list.findIndex(item => this.equals(item, value, dataKey))
                : list.findIndex(item => item === value);
        }

        return -1;
    }

    static getJSXElement(obj: any, ...params: any[]): any {
        return this.isFunction(obj) ? obj(...params) : obj;
    }

    static getItemValue(obj: any, ...params: any[]): any {
        return this.isFunction(obj) ? obj(...params) : obj;
    }

    static getProp<O extends Object>(props: O, prop: keyof O, defaultProps: O): O[keyof O] {
        const value = props ? props[prop] : undefined;

        return value === undefined ? defaultProps[prop] : value;
    }

    static getPropCaseInsensitive<O extends Object>(props: O, prop: keyof O, defaultProps: O): any {
        const fkey = this.toFlatCase(prop as string);

        // eslint-disable-next-line no-restricted-syntax
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key) && this.toFlatCase(key) === fkey) {
                return props[key];
            }
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const key in defaultProps) {
            if (
                Object.prototype.hasOwnProperty.call(defaultProps, key) &&
                this.toFlatCase(key) === fkey
            ) {
                return defaultProps[key];
            }
        }

        return undefined; // Property not found
    }

    static getMergedProps(props: object, defaultProps: object): object {
        // return Object.assign({}, defaultProps, props);
        return { ...defaultProps, ...props };
    }

    static getDiffProps(props: object, defaultProps: object): object {
        return this.findDiffKeys(props, defaultProps);
    }

    static getPropValue(obj: any, ...params: any[]): any {
        return this.isFunction(obj) ? obj(...params) : obj;
    }

    static getComponentProp(component: any, prop: string = '', defaultProps: object = {}): any {
        return this.isNotEmpty(component)
            ? this.getProp(component.props, prop, defaultProps)
            : undefined;
    }

    static getComponentProps(component: any, defaultProps: object = {}): object | undefined {
        return this.isNotEmpty(component)
            ? this.getMergedProps(component.props, defaultProps)
            : undefined;
    }

    static getComponentDiffProps(component: any, defaultProps: object = {}): object | undefined {
        return this.isNotEmpty(component)
            ? this.getDiffProps(component.props, defaultProps)
            : undefined;
    }

    static isValidChild(child: any, type: string, validTypes?: any[]): boolean {
        /* eslint-disable */
        if (child) {
            let childType =
                this.getComponentProp(child, '__TYPE') ||
                (child.type ? child.type.displayName : undefined);

            // for App Router in Next.js ^14,
            if (!childType && child?.type?._payload?.value) {
                childType = child.type._payload.value.find(v => v === type);
            }

            const isValid = childType === type;

            try {
                if (process.env.NODE_ENV !== 'production' && !isValid) {
                    if (validTypes && validTypes.includes(childType)) {
                        return false;
                    }
                    const messageTypes = validTypes ? validTypes : [type];

                    console.error(
                        `PrimeReact: Unexpected type; '${childType}'. Parent component expects a ${messageTypes.map(t => `${t}`).join(' or ')} component or a component with the ${messageTypes
                            .map(t => `__TYPE="${t}"`)
                            .join(' or ')} property as a child component.`,
                    );
                    return false;
                }
            } catch (error) {
                // NOOP
            }

            return isValid;
        }

        return false;
        /* eslint-enable */
    }

    static getRefElement(ref: any): any {
        if (ref) {
            return typeof ref === 'object' && Object.prototype.hasOwnProperty.call(ref, 'current')
                ? ref.current
                : ref;
        }

        return null;
    }

    static combinedRefs(innerRef: any, forwardRef: any): void {
        if (innerRef && forwardRef) {
            if (typeof forwardRef === 'function') {
                forwardRef(innerRef.current);
            } else {
                forwardRef.current = innerRef.current;
            }
        }
    }

    static removeAccents(str: any): string {
        if (str && str.search(/[\xC0-\xFF]/g) > -1) {
            str = str
                .replace(/[\xC0-\xC5]/g, 'A')
                .replace(/\xC6/g, 'AE')
                .replace(/\xC7/g, 'C')
                .replace(/[\xC8-\xCB]/g, 'E')
                .replace(/[\xCC-\xCF]/g, 'I')
                .replace(/\xD0/g, 'D')
                .replace(/\xD1/g, 'N')
                .replace(/[\xD2-\xD6\xD8]/g, 'O')
                .replace(/[\xD9-\xDC]/g, 'U')
                .replace(/\xDD/g, 'Y')
                .replace(/\xDE/g, 'P')
                .replace(/[\xE0-\xE5]/g, 'a')
                .replace(/\xE6/g, 'ae')
                .replace(/\xE7/g, 'c')
                .replace(/[\xE8-\xEB]/g, 'e')
                .replace(/[\xEC-\xEF]/g, 'i')
                .replace(/\xF1/g, 'n')
                .replace(/[\xF2-\xF6\xF8]/g, 'o')
                .replace(/[\xF9-\xFC]/g, 'u')
                .replace(/\xFE/g, 'p')
                .replace(/[\xFD\xFF]/g, 'y');
        }

        return str;
    }

    static toFlatCase(str: string): string {
        // convert snake, kebab, camel and pascal cases to flat case
        return this.isNotEmpty(str) && this.isString(str)
            ? str.replace(/([-_])/g, '').toLowerCase()
            : str;
    }

    static toCapitalCase(str: string): string {
        return this.isNotEmpty(str) && this.isString(str)
            ? str[0].toUpperCase() + str.slice(1)
            : str;
    }

    static trim(value: any): any {
        // trim only if the value is actually a string
        return this.isNotEmpty(value) && this.isString(value) ? value.trim() : value;
    }

    static isEmpty(value: any): boolean {
        return (
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (!(value instanceof Date) &&
                typeof value === 'object' &&
                Object.keys(value).length === 0)
        );
    }

    static isNotEmpty(value: any): boolean {
        return !this.isEmpty(value);
    }

    static isFunction(value: any): boolean {
        return (
            !!(value && value.constructor && value.call && value.apply) &&
            typeof value === 'function'
        );
    }

    static isObject(value: any): boolean {
        return value !== null && value instanceof Object && value.constructor === Object;
    }

    static isDate(value: any): boolean {
        return value !== null && value instanceof Date && value.constructor === Date;
    }

    static isArray(value: any): boolean {
        return value !== null && Array.isArray(value);
    }

    static isString(value: any): boolean {
        return value !== null && typeof value === 'string';
    }

    static isPrintableCharacter(char: string = ''): boolean {
        return this.isNotEmpty(char) && char.length === 1 && !!char.match(/\S| /);
    }

    static isLetter(char: string): boolean {
        return /^[a-zA-Z\u00C0-\u017F]$/.test(char);
    }

    /**
     * Firefox-v103 does not currently support the "findLast" method. It is stated that this method will be supported with Firefox-v104.
     * https://caniuse.com/mdn-javascript_builtins_array_findlast
     */
    static findLast(arr: any[], callback: () => any): any {
        let item;

        if (this.isNotEmpty(arr)) {
            try {
                item = arr.findLast(callback);
            } catch {
                item = [...arr].reverse().find(callback);
            }
        }

        return item;
    }

    /**
     * Firefox-v103 does not currently support the "findLastIndex" method. It is stated that this method will be supported with Firefox-v104.
     * https://caniuse.com/mdn-javascript_builtins_array_findlastindex
     */
    static findLastIndex(arr: any[], callback: () => any): number {
        let index = -1;

        if (this.isNotEmpty(arr)) {
            try {
                index = arr.findLastIndex(callback);
            } catch {
                index = arr.lastIndexOf([...arr].reverse().find(callback));
            }
        }

        return index;
    }

    static sort(value1: any, value2: any, comparator: any, order = 1, nullSortOrder = 1) {
        const result = this.compare(value1, value2, comparator, order);
        let finalSortOrder = order;

        // nullSortOrder == 1 means Excel like sort nulls at bottom
        if (this.isEmpty(value1) || this.isEmpty(value2)) {
            finalSortOrder = nullSortOrder === 1 ? order : nullSortOrder;
        }

        return finalSortOrder * result;
    }

    static compare(value1: any, value2: any, comparator: any, order = 1) {
        let result = -1;
        const emptyValue1 = this.isEmpty(value1);
        const emptyValue2 = this.isEmpty(value2);

        if (emptyValue1 && emptyValue2) result = 0;
        else if (emptyValue1) result = order;
        else if (emptyValue2) result = -order;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
            result = comparator(value1, value2);
        else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

        return result;
    }

    static localeComparator(locale: string | string[]) {
        // performance gain using Int.Collator. It is not recommended to use localeCompare against large arrays.
        return new Intl.Collator(locale, { numeric: true }).compare;
    }

    static findChildrenByKey(data: { key: any; children: any[] }[], key: any): any | any[] {
        // for (const item of data) {
        //     if (item.key === key) {
        //         return item.children || [];
        //     }
        //     if (item.children) {
        //         const result = this.findChildrenByKey(item.children, key);
        //
        //         if (result.length > 0) {
        //             return result;
        //         }
        //     }
        // }

        let ret: any[] = [];

        data.forEach(item => {
            if (item.key === key) {
                ret = item.children || [];
            }
            if (item.children) {
                const result = this.findChildrenByKey(item.children, key);

                if (result.length > 0) {
                    ret = result;
                }
            }
        });

        return ret;
    }

    /**
     * This function takes mutates and object with a new value given
     * a specific field. This will handle deeply nested fields that
     * need to be modified or created.
     *
     * e.g:
     * data = {
     *  nested: {
     *      foo: "bar"
     *  }
     * }
     *
     * field = "nested.foo"
     * value = "baz"
     *
     * The function will mutate data to be
     * e.g:
     * data = {
     *  nested: {
     *      foo: "baz"
     *  }
     * }
     *
     * @param {object} data the object to be modified
     * @param {string} field the field in the object to replace
     * @param {any} value the value to have replaced in the field
     */
    static mutateFieldData(data: object, field: string, value: any): void {
        const fields = field.split('.');
        let obj = data;

        for (let i = 0, len = fields.length; i < len; ++i) {
            // Check if we are on the last field
            if (i + 1 - len === 0) {
                obj[fields[i]] = value;
                break;
            }

            if (!obj[fields[i]]) {
                obj[fields[i]] = {};
            }

            obj = obj[fields[i]];
        }
    }
}
