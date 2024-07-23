import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context';

type Props = {};

const ModeToggle: React.FC<Props> = () => {
    const { setTheme, theme } = useTheme();

    console.log(theme);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className="tw-h-[1.2rem] tw-w-[1.2rem] tw-rotate-0 tw-scale-100 tw-transition-all dark:-tw-rotate-90 dark:tw-scale-0" />
                    <Moon className="tw-absolute tw-h-[1.2rem] tw-w-[1.2rem] tw-rotate-90 tw-scale-0 tw-transition-all dark:tw-rotate-0 dark:tw-scale-100" />
                    <span className="tw-sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ModeToggle;
