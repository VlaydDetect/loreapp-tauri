import React from 'react';

type Props = {
    dropPosition: -1 | 0 | 1;
    dropLevelOffset: number;
    indent: number;
};

const DropIndicator: React.FC<Props> = ({ dropPosition, dropLevelOffset, indent }) => {
    const style: React.CSSProperties = {
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        backgroundColor: 'red',
        height: 2,
    };
    switch (dropPosition) {
        case -1:
            style.top = 0;
            style.left = -dropLevelOffset * indent;
            break;
        case 1:
            style.bottom = 0;
            style.left = -dropLevelOffset * indent;
            break;
        case 0:
            style.bottom = 0;
            style.left = indent;
            break;
    }
    return <div style={style} />;
};

export default DropIndicator;
