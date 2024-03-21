import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Document } from '@/interface';

const DocumentCard = ({ document }: { document: Document }) => {
    // const navigate = useNavigate();

    return (
        <Card sx={{ width: { md: '320px', xs: '100%' }, boxShadow: 'none', borderRadius: 0 }}>
            {/*<div onClick={() => navigate(`${document.id}`)}>*/}
            <div>
                <CardContent sx={{ backgroundColor: '#1e1e1e', height: '106px' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="#fff">
                        {document.title ? document.title : ''}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="gray"
                        width="inherit"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {document.body ? document.body : ''}
                    </Typography>
                </CardContent>
            </div>
        </Card>
    );
};

export default DocumentCard;
