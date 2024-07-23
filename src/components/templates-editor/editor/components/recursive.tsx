import React from 'react';
import { EditorElement } from '@/components/templates-editor/types';
import TextComponent from './text';
import Container from './container';
import VideoComponent from './video';
// import ImageComponent from './image';

type Props = {
    element: EditorElement;
};

const Recursive: React.FC<Props> = ({ element }) => {
    switch (element.type) {
        case '__body':
        case 'container':
        case '2Col':
            return <Container element={element} />;
        case 'text':
            return <TextComponent element={element} />;
        case 'video':
            return <VideoComponent element={element} />;
        // case 'image':
        //     return <ImageComponent element={element} />;
        default:
            return null;
    }
};

export default Recursive;
