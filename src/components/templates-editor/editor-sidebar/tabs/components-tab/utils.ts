import React from 'react';
import { EditorBtns } from '@/components/templates-editor/types';

export const handlePlaceholderDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;

    e.dataTransfer.setData('componentType', type);
};
