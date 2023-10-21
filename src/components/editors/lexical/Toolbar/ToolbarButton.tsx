import * as Toolbar from '@radix-ui/react-toolbar';
import './toolbarStyles.css'

interface ToolbarButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
    children: React.ReactNode;
}

const ToolbarButton = ({onClick, children}: ToolbarButtonProps) => {
    return (
        <Toolbar.Button className="toolbarButton" onClick={onClick}>
            {children}
        </Toolbar.Button>
    );
}

export default ToolbarButton