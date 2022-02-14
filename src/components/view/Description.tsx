import { Box, Typography, Paper } from '@mui/material';

export default function Description({ description }: { description?: string }){
    return (
        <Box sx={{ marginTop: "10px" }}>
            <Typography variant='h5' sx={{ marginBottom: "5px" }}>Description</Typography>
            <Paper elevation={3} sx={{ padding: "10px" }}>
                <Typography variant="body1">{description}</Typography>
            </Paper>
        </Box>
    );
}