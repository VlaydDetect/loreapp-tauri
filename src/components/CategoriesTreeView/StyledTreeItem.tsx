import * as React from 'react';
import {useSpring, animated} from '@react-spring/web';
import {TransitionProps} from "@mui/material/transitions";
import Collapse from "@mui/material/collapse";
import {alpha, styled} from '@mui/material/styles';
import {TreeItem, TreeItemProps, treeItemClasses, useTreeItem, TreeItemContentProps} from '@mui/x-tree-view/TreeItem';
import {SvgIconProps} from '@mui/material/SvgIcon';
import {useTheme, Box, Typography} from "@mui/material";
import clsx from "clsx";

declare module 'react' {
    interface CSSProperties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
}

type StyledTreeItemProps = TreeItemProps & {
    bgColor?: string;
    bgColorForDarkMode?: string;
    color?: string;
    colorForDarkMode?: string;
    // labelIcon: React.ElementType<SvgIconProps>;
    labelInfo?: string;
    labelText: string;
};

const TransitionComponent: React.FC<TransitionProps> = (props) => {
    const style = useSpring({
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
};

const CustomContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref
) {
    const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
    } = props;

    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        handleSelection,
        preventSelection,
    } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        preventSelection(event);
        // handleSelection(event);
        // console.log(`CustomContent (handleMouseDown) (nodeId: ${nodeId}): { expanded: ${expanded}, selected: ${selected}, focused: ${focused} }`);
    };

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        handleExpansion(event);
        console.log(`CustomContent (handleExpansionClick) (nodeId: ${nodeId}): { expanded: ${expanded}, selected: ${selected}, focused: ${focused} }`);
    };

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleSelection(event);
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleSelection(event);
    }

    return (
        <div
            className={clsx(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            // onMouseDown={handleMouseDown}
            onContextMenu={event => handleSelection(event)}
            // onDoubleClick={(event) => handleDoubleClick(event)}
            ref={ref as React.Ref<HTMLDivElement>}
        >
            <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon}
            </div>
            <Typography
                onClick={handleSelectionClick}
                component="div"
                className={classes.label}
            >
                {label}
            </Typography>
        </div>
    );
});

const CustomTreeItem = React.forwardRef((props: TreeItemProps, ref: React.Ref<HTMLLIElement>) => (
    <TreeItem {...props} ContentComponent={CustomContent} TransitionComponent={TransitionComponent} ref={ref}/>
));

const CustomStyledTreeItem = styled(CustomTreeItem)(({theme}) => ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.5)}`,
        [`& .${treeItemClasses.content}`]: {
            paddingLeft: theme.spacing(1),
        },
    },
    [`& .${treeItemClasses.content}`]: {
        color: theme.palette.text.secondary,
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, transparent)`,
            color: 'var(--tree-view-color)',
        },
        '&.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: 'var(--tree-view-color)',
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
    },
})) as unknown as typeof TreeItem;

const StyledTreeItem = React.forwardRef(function StyledTreeItem(
    props: StyledTreeItemProps,
    ref: React.Ref<HTMLLIElement>,
) {

    const theme = useTheme();
    const {
        bgColor,
        color,
        // labelIcon: LabelIcon,
        labelInfo,
        labelText,
        colorForDarkMode,
        bgColorForDarkMode,
        ...other
    } = props;

    const styleProps = {
        '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
        '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
    };

    return (
        <CustomStyledTreeItem
            label={
                <Box sx={{display: 'flex', alignItems: 'center', p: 0.5, pr: 0}}>
                    {/*<Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />*/}
                    <Typography variant="body2" sx={{fontWeight: 'inherit', flexGrow: 1}}>{labelText}</Typography>
                    <Typography variant="caption" color="inherit">{labelInfo}</Typography>
                </Box>
            }
            style={styleProps}
            {...other}
            ref={ref}
        />
    );
});

export default StyledTreeItem;
