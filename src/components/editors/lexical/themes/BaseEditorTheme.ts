/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorThemeClasses} from 'lexical';

import './BaseEditorTheme.css';

const theme: EditorThemeClasses = {
    blockCursor: 'BaseEditorTheme__blockCursor',
    characterLimit: 'BaseEditorTheme__characterLimit',
    code: 'BaseEditorTheme__code',
    codeHighlight: {
        atrule: 'BaseEditorTheme__tokenAttr',
        attr: 'BaseEditorTheme__tokenAttr',
        boolean: 'BaseEditorTheme__tokenProperty',
        builtin: 'BaseEditorTheme__tokenSelector',
        cdata: 'BaseEditorTheme__tokenComment',
        char: 'BaseEditorTheme__tokenSelector',
        class: 'BaseEditorTheme__tokenFunction',
        'class-name': 'BaseEditorTheme__tokenFunction',
        comment: 'BaseEditorTheme__tokenComment',
        constant: 'BaseEditorTheme__tokenProperty',
        deleted: 'BaseEditorTheme__tokenProperty',
        doctype: 'BaseEditorTheme__tokenComment',
        entity: 'BaseEditorTheme__tokenOperator',
        function: 'BaseEditorTheme__tokenFunction',
        important: 'BaseEditorTheme__tokenVariable',
        inserted: 'BaseEditorTheme__tokenSelector',
        keyword: 'BaseEditorTheme__tokenAttr',
        namespace: 'BaseEditorTheme__tokenVariable',
        number: 'BaseEditorTheme__tokenProperty',
        operator: 'BaseEditorTheme__tokenOperator',
        prolog: 'BaseEditorTheme__tokenComment',
        property: 'BaseEditorTheme__tokenProperty',
        punctuation: 'BaseEditorTheme__tokenPunctuation',
        regex: 'BaseEditorTheme__tokenVariable',
        selector: 'BaseEditorTheme__tokenSelector',
        string: 'BaseEditorTheme__tokenSelector',
        symbol: 'BaseEditorTheme__tokenProperty',
        tag: 'BaseEditorTheme__tokenProperty',
        url: 'BaseEditorTheme__tokenOperator',
        variable: 'BaseEditorTheme__tokenVariable',
    },
    embedBlock: {
        base: 'BaseEditorTheme__embedBlock',
        focus: 'BaseEditorTheme__embedBlockFocus',
    },
    hashtag: 'BaseEditorTheme__hashtag',
    heading: {
        h1: 'BaseEditorTheme__h1',
        h2: 'BaseEditorTheme__h2',
        h3: 'BaseEditorTheme__h3',
        h4: 'BaseEditorTheme__h4',
        h5: 'BaseEditorTheme__h5',
        h6: 'BaseEditorTheme__h6',
    },
    image: 'editor-image',
    indent: 'BaseEditorTheme__indent',
    inlineImage: 'inline-editor-image',
    link: 'BaseEditorTheme__link',
    list: {
        listitem: 'BaseEditorTheme__listItem',
        listitemChecked: 'BaseEditorTheme__listItemChecked',
        listitemUnchecked: 'BaseEditorTheme__listItemUnchecked',
        nested: {
            listitem: 'BaseEditorTheme__nestedListItem',
        },
        olDepth: [
            'BaseEditorTheme__ol1',
            'BaseEditorTheme__ol2',
            'BaseEditorTheme__ol3',
            'BaseEditorTheme__ol4',
            'BaseEditorTheme__ol5',
        ],
        ul: 'BaseEditorTheme__ul',
    },
    ltr: 'BaseEditorTheme__ltr',
    mark: 'BaseEditorTheme__mark',
    markOverlap: 'BaseEditorTheme__markOverlap',
    paragraph: 'BaseEditorTheme__paragraph',
    quote: 'BaseEditorTheme__quote',
    rtl: 'BaseEditorTheme__rtl',
    table: 'BaseEditorTheme__table',
    tableAddColumns: 'BaseEditorTheme__tableAddColumns',
    tableAddRows: 'BaseEditorTheme__tableAddRows',
    tableCell: 'BaseEditorTheme__tableCell',
    tableCellActionButton: 'BaseEditorTheme__tableCellActionButton',
    tableCellActionButtonContainer:
        'BaseEditorTheme__tableCellActionButtonContainer',
    tableCellEditing: 'BaseEditorTheme__tableCellEditing',
    tableCellHeader: 'BaseEditorTheme__tableCellHeader',
    tableCellPrimarySelected: 'BaseEditorTheme__tableCellPrimarySelected',
    tableCellResizer: 'BaseEditorTheme__tableCellResizer',
    tableCellSelected: 'BaseEditorTheme__tableCellSelected',
    tableCellSortedIndicator: 'BaseEditorTheme__tableCellSortedIndicator',
    tableResizeRuler: 'BaseEditorTheme__tableCellResizeRuler',
    tableSelected: 'BaseEditorTheme__tableSelected',
    tableSelection: 'BaseEditorTheme__tableSelection',
    text: {
        bold: 'BaseEditorTheme__textBold',
        code: 'BaseEditorTheme__textCode',
        italic: 'BaseEditorTheme__textItalic',
        strikethrough: 'BaseEditorTheme__textStrikethrough',
        subscript: 'BaseEditorTheme__textSubscript',
        superscript: 'BaseEditorTheme__textSuperscript',
        underline: 'BaseEditorTheme__textUnderline',
        underlineStrikethrough: 'BaseEditorTheme__textUnderlineStrikethrough',
    },
};

export default theme;
