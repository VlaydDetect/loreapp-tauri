import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getRoot, $getSelection, $isRangeSelection} from "lexical";
import {$setBlocksType} from "@lexical/selection";
import {$createHeadingNode, HeadingTagType} from "@lexical/rich-text";
import ToolbarButton from "@/components/editors/lexical/Toolbar/ToolbarButton";

const headingVariants: HeadingTagType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const HeadingToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext()

    const onClick = (tag: HeadingTagType) => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(tag))
            }
        })
    }

    return (
        <>
            {headingVariants.map(tag => (
                <ToolbarButton onClick={() => {onClick(tag)}}  key={tag}>{tag.toUpperCase()}</ToolbarButton>
            ))}
        </>
    );
};

export default HeadingToolbarPlugin
