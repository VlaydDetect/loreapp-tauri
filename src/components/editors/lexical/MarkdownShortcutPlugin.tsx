import React from 'react';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { TRANSFORMERS } from './MarkdownTransformers';

export default function MarkdownPlugin(): JSX.Element {
    return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
