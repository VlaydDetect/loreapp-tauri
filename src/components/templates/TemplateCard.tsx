import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { SquareMousePointer, Trash2 } from 'lucide-react';
import { DocumentsTemplate } from '@/interface';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMobXStores } from '@/context';
// import { Route } from '@/routes/tabs.$tabId.templates.index';

type Props = {
    template: DocumentsTemplate;
};

const TemplateCard: React.FC<Props> = ({ template }) => {
    const { id, name, description } = template;

    const {
        documentsAndFoldersStore: { createUntitledDocument },
    } = useMobXStores();

    const {
        documentsTemplatesStore: { deleteTemplate },
    } = useMobXStores();

    const navigate = useNavigate();

    // TODO: create new document using template and navigate to it
    const handleUseTemplate = async () => {
        const response = await createUntitledDocument();
        navigate({});
    };

    const handleDeleteTemplate = () => deleteTemplate(id);

    return (
        <Card className="tw-w-full tw-flex tw-items-center tw-justify-between">
            <CardHeader className="tw-gap-4">
                <Link
                    // from={Route.fullPath}
                    // to="./$templateId"
                    // params={{ templateId: id }}
                    to="/tabs/$tabId/templates/$templateId"
                    params={prev => ({ ...prev, templateId: id })}
                >
                    {/* TODO: maybe icon */}
                    <div>
                        <CardTitle className="tw-text-lg">{name}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </Link>
            </CardHeader>
            <div className="tw-flex tw-flex-row">
                <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-p-4">
                    <Label htmlFor="use-template" className="tw-text-muted-foreground">
                        Use
                    </Label>
                    <Button
                        id="use-template"
                        size="icon"
                        variant="ghost"
                        onClick={handleUseTemplate}
                    >
                        <SquareMousePointer />
                    </Button>
                </div>
                <div className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-p-4">
                    <Label htmlFor="use-template" className="tw-text-muted-foreground">
                        Delete
                    </Label>
                    <Button
                        id="use-template"
                        size="icon"
                        variant="ghost"
                        onClick={handleDeleteTemplate}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TemplateCard;
