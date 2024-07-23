/**
 * Calculates the zoom level of an element as a result of using
 * css zoom property.
 * @param element
 */
export function calculateZoomLevel(element: Element | null): number {
    let zoom = 1;
    while (element) {
        zoom *= Number(window.getComputedStyle(element).getPropertyValue('zoom'));
        element = element.parentElement;
    }
    return zoom;
}
