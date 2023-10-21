import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND} from "@lexical/list";
import {ListNodeTagType} from "@lexical/list/LexicalListNode";
import ToolbarButton from "@/components/editors/lexical/Toolbar/ToolbarButton";
import {OrderedListIcon, UnorderedListIcon} from "@/components/editors/lexical/Icons";

const ListToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();

    const onClick = (tag: ListNodeTagType) => {
        switch (tag) {
            case 'ol': {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
                break
            }
            case 'ul': {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
                break
            }
        }
    }

    return (
        <>
            <ToolbarButton onClick={() => {onClick('ol')}}><OrderedListIcon /></ToolbarButton>
            <ToolbarButton onClick={() => {onClick('ul')}}><UnorderedListIcon /></ToolbarButton>
        </>
    )
};

export default ListToolbarPlugin
