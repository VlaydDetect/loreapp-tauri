import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card';
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
import { useMobXStores, useModal } from '@/context';

const TemplateFormSchema = z.object({
    name: z.string().min(1, 'Required'),
    description: z.string().optional(),
});

type Props = {
    title?: string;
    subtitle?: string;
};

const TemplateForm: React.FC<Props> = ({ title, subtitle }) => {
    const {
        documentsTemplatesStore: { createTemplateAsync },
    } = useMobXStores();

    const form = useForm<z.infer<typeof TemplateFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(TemplateFormSchema),
        defaultValues: {
            name: '',
            description: undefined,
        },
    });

    const idLoading = form.formState.isLoading;

    const { setClose } = useModal();

    const handleSubmit = async (values: z.infer<typeof TemplateFormSchema>) => {
        try {
            const response = await createTemplateAsync({
                name: values.name,
                description: values.description,
            });
            toast('Success', { description: `Created Documents Template | ${response.name}` });
        } catch (error) {
            console.error(error);
            toast('Failed', { description: 'Failed to Create Documents Template' });
        }
        setClose();
    };

    return (
        <Card className="tw-w-full tw-max-w-[650px] tw-border-none">
            {(title || subtitle) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {subtitle && <CardDescription>{subtitle}</CardDescription>}
                </CardHeader>
            )}
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="tw-flex tw-flex-col tw-gap-4 tw-text-left"
                    >
                        <FormField
                            disabled={idLoading}
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            disabled={idLoading}
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button className="tw-mt-4" disabled={idLoading} type="submit">
                            {idLoading ? (
                                <>
                                    <Loader2 className="tw-mr-2 tw-h-4 tw-w-4 tw-animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Template Settings'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default TemplateForm;
