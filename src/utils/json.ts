type CmpObj = {
    key: any;
    value: any;
};

type Options = {
    cycles?: boolean;
    cmp?: (a: CmpObj, b: CmpObj) => number;
};

export const JSONStringify = (data: any, opts?: Options): string => {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    const cycles = typeof opts.cycles === 'boolean' ? opts.cycles : false;

    const cmp =
        opts.cmp &&
        (function (f) {
            return function (node: any) {
                return function (a: string, b: string) {
                    const aobj = { key: a, value: node[a] };
                    const bobj = { key: b, value: node[b] };
                    return f(aobj, bobj);
                };
            };
        })(opts.cmp);

    const seen: any[] = [];
    return (function stringify(node: any) {
        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        if (node === undefined) return '';
        if (typeof node === 'number') return Number.isFinite(node) ? `${node}` : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);

        let i, out;
        if (Array.isArray(node)) {
            out = '[';
            for (i = 0; i < node.length; i++) {
                if (i) out += ',';
                out += stringify(node[i]) || 'null';
            }
            return `${out}]`;
        }

        if (node === null) return 'null';

        if (seen.indexOf(node) !== -1) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        const seenIndex = seen.push(node) - 1;
        const keys = Object.keys(node).sort(cmp && cmp(node));
        out = '';
        for (i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = stringify(node[key]);

            if (!value) continue;
            if (out) out += ',';
            out += `${JSON.stringify(key)}:${value}`;
        }
        seen.splice(seenIndex, 1);
        return `{${out}}`;
    })(data);
};
