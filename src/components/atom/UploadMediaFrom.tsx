import React from 'react';
import { observer } from 'mobx-react-lite';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { choosePictureFile } from '@/fs/fs';
import { useMobXStores, useModal } from '@/context';

type Props = {};

const schema = z.object({
    path: z.string().min(1, { message: 'Media File is required' }),
    name: z.string().min(1, { message: 'Name is required' }),
});

const UploadMediaFrom: React.FC<Props> = observer(() => {
    const {
        picturesStore: { createPictureAsync },
    } = useMobXStores();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
        defaultValues: {
            name: '',
            path: '',
        },
    });

    const { setClose } = useModal();

    async function onSubmit(values: z.infer<typeof schema>) {
        try {
            const response = await createPictureAsync({ path: values.path, name: values.name });
            toast({ title: 'Success', description: `Uploaded media | ${response.name}` });
            setClose();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: 'Could not uploaded media',
            });
        }
    }

    return (
        <Card className="tw-w-full">
            <CardHeader>
                <CardTitle>Media Information</CardTitle>
                <CardDescription>Please enter the details for your file</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="tw-flex-1">
                                    <FormLabel>Picture Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="tw-text-black"
                                            placeholder="Media Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="path"
                            render={({ field }) => (
                                <FormItem className="tw-flex-1 tw-mt-3">
                                    <FormLabel>Media File</FormLabel>
                                    <FormControl>
                                        <div className="tw-flex tw-w-full tw-items-center tw-space-x-2">
                                            <Input
                                                className="tw-text-black"
                                                placeholder="Media Path"
                                                {...field}
                                            />
                                            <Button
                                                onClick={async () => {
                                                    const file = await choosePictureFile();
                                                    if (file !== null && typeof file === 'string') {
                                                        form.setValue('path', file);
                                                    }
                                                }}
                                            >
                                                Choose file...
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="tw-mt-4">
                            Upload Media
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
});

export default UploadMediaFrom;
