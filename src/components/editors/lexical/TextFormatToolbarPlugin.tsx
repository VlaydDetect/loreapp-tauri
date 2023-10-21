import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isRangeSelection, $getSelection, type TextFormatType } from 'lexical';
import {
    StrikethroughIcon,
    FontBoldIcon,
    FontItalicIcon,
    UnderlineIcon,
} from '@radix-ui/react-icons';
import ToolbarButton from "@/components/editors/lexical/Toolbar/ToolbarButton";

const TextFormatToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const getIcon = (format: TextFormatType): JSX.Element | null => {
        switch (format) {
            case 'bold':            return <FontBoldIcon />;
            case 'italic':          return <FontItalicIcon />;
            case 'strikethrough':   return <StrikethroughIcon />;
            case 'underline':       return <UnderlineIcon />;
            default:                return null;
        }
    };
    const onClick = (format: TextFormatType): void => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.formatText(format);
            }
        });
    };
    const supportedTextFormats: TextFormatType[] = ['bold', 'italic', 'underline', 'strikethrough'];
    return (
        <>
            {supportedTextFormats.map((format) => (
                <ToolbarButton
                    key={format}
                    onClick={() => {
                        onClick(format);
                    }}
                >
                    {getIcon(format)}
                </ToolbarButton>
            ))}
        </>
    );
}

export default TextFormatToolbarPlugin
