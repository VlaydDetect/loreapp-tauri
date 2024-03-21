import React, { useState } from 'react';
import { Copy, MoreHorizontal, Trash } from 'lucide-react';
import { Picture } from '@/interface';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { picFmc } from '@/db';

type Props = {
    picture: Picture;
};

const MediaCard: React.FC<Props> = ({ picture }) => {
    const [loading, setLoading] = useState(false);

    return (
        <AlertDialog>
            <DropdownMenu>
                <article className="tw-border tw-w-full tw-rounded-lg tw-bg-slate-900">
                    <div className="tw-relative tw-w-full tw-h-40">
                        <img
                            src={picture.img_path}
                            alt="preview image"
                            className="tw-object-cover tw-rounded-lg"
                        />
                    </div>
                    <p className="tw-opacity-0 tw-h-0 tw-w-0">{picture.title}</p>
                    <div className="tw-p-4 tw-relative">
                        <p className="tw-text-muted-foreground">
                            {new Date(picture.ctime).toDateString()}
                        </p>
                        <p>{picture.title}</p>
                        <div className="tw-absolute tw-top-4 tw-right-4 tw-p-[1px] tw-cursor-pointer">
                            <DropdownMenuTrigger>
                                <MoreHorizontal />
                            </DropdownMenuTrigger>
                        </div>
                    </div>

                    <DropdownMenuContent>
                        <DropdownMenuLabel>Menu</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="tw-flex tw-gap-2"
                            onClick={() => {
                                // TODO: copy to clipboard
                                navigator.clipboard.writeText(picture.img_path);
                                toast({ title: 'Copied to Clipboard' });
                            }}
                        >
                            <Copy size={15} /> Copy Image Link
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="tw-flex tw-gap-2">
                                <Trash size={15} /> Delete file
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </article>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="tw-text-left">
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="tw-text-left">
                        Are you sure want to delete this file? All documents using this file will no
                        longer have access to it!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="tw-flex tw-items-center">
                    <AlertDialogCancel className="tw-mb-2">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        className="tw-bg-destructive hover:tw-bg-destructive"
                        onClick={async () => {
                            setLoading(true);
                            const response = await picFmc.delete(picture.id);
                            toast({
                                title: 'Deleted File',
                                description: `Picture ${response.title} successfully deleted`,
                            });
                            setLoading(false);
                            window.location.reload();
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default MediaCard;
