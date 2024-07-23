import React from 'react';
import { EditorElement } from '@/components/templates-editor/types';
import Text from './text';
import Container from './container';
import Video from './video';
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
            return <Text element={element} />;
        case 'video':
            return <Video element={element} />;
        // case 'image':
        //     return <ImageComponent element={element} />;
        default:
            return null;
    }
};

export default Recursive;
