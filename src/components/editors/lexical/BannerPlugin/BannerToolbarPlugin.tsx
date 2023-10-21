import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {INSERT_BANNER_COMMAND} from "@/components/editors/lexical/BannerPlugin/BannerNode";
import {PlusCircledIcon} from "@radix-ui/react-icons";
import ToolbarButton from "@/components/editors/lexical/Toolbar/ToolbarButton";


const BannerToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const onClick = (e: React.MouseEvent): void => {
        editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined);
    };
    return (
        <ToolbarButton onClick={onClick}>
            <PlusCircledIcon />
            Banner
        </ToolbarButton>
    );
}

export default BannerToolbarPlugin
