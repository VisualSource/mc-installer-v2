import { Paper, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function Footer(){
    const naviagate = useNavigate();
    return (
        <Paper square component="footer" elevation={2} id="app-footer">
            <div id="app-footer-link" onClick={()=>naviagate("/downloads")}>
                <Typography variant="subtitle1">Downloads</Typography>
                <Typography color="gray" variant="body2">Manage</Typography>
            </div>
        </Paper>
    );
}