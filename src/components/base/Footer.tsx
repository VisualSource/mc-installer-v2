import { Paper, Typography, Box } from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function Footer(){
    const naviagate = useNavigate();
    return (
        <Paper square component="footer" elevation={2} id="app-footer">
            <Box id="app-footer-download" onClick={()=>naviagate("/downloads")}>
                <Typography variant="subtitle1">Downloads</Typography>
                <Typography color="gray" variant="body2">Manage</Typography>
            </Box>
        </Paper>
    );
}