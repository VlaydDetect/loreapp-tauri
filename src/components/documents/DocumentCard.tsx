import {Link} from "react-router-dom";
import {Card, CardContent, Typography} from "@mui/material";
import {IDocument} from "@/interface";

const DocumentCard = ({ document }: { document: IDocument }) => {
    return (
        <Card sx={{ width: { md: '320px', xs: '100%' }, boxShadow: 'none', borderRadius: 0 }}>
            <Link to={document.id ? `/document/${document.id}` : ""}> {/* TODO: Not Found page? */}
                <CardContent sx={{ backgroundColor: '#1e1e1e', height: '106px' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="#fff">{document.title ? document.title : ""}</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="gray" width="inherit" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{document.body ? document.body : ""}</Typography>
                </CardContent>
            </Link>
        </Card>
    );
};

export default DocumentCard
