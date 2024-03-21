export function ownerDocument(node: Node | null | undefined): Document {
    return (node && node.ownerDocument) || document;
}

export function ownerWindow(node: Node | undefined): Window {
    const doc = ownerDocument(node);
    return doc.defaultView || window;
}

// A change of the browser zoom change the scrollbar size.
// Credit https://github.com/twbs/bootstrap/blob/488fd8afc535ca3a6ad4dc581f5e89217b6a36ac/js/src/util/scrollbar.js#L14-L18
export function getScrollbarSize(doc: Document): number {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
    const documentWidth = doc.documentElement.clientWidth;
    return Math.abs(window.innerWidth - documentWidth);
}
