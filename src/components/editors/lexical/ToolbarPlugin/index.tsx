import HeadingToolbarPlugin from "@/components/editors/lexical/HeadingToolbarPlugin";
import ListToolbarPlugin from "@/components/editors/lexical/ListToolbarPlugin";
import BannerColorPickerPlugin from "@/components/editors/lexical/BannerPlugin/BannerColorPickerPlugin";
import BannerToolbarPlugin from "@/components/editors/lexical/BannerPlugin/BannerToolbarPlugin";
import TextFormatToolbarPlugin from "@/components/editors/lexical/TextFormatToolbarPlugin";
import * as Toolbar from '@radix-ui/react-toolbar';
import './toolbarStyles.css'

const ToolbarPlugin = () => {
    return (
        <Toolbar.Root className="toolbarRoot">
            <TextFormatToolbarPlugin />
            <HeadingToolbarPlugin />
            <ListToolbarPlugin />
            <BannerToolbarPlugin />
            <BannerColorPickerPlugin />
        </Toolbar.Root>
    );
};

export default ToolbarPlugin
