import { Box, Paper, Typography, Chip } from '@mui/material';
import { Loader } from '../../lib/db';

export default function SupportVersions({ mc, supports }: { mc: string[] | undefined, supports: Loader[] | undefined }){
    return (
        <Box sx={{ marginTop: "10px" }}>
            <Typography variant='h5'>Info</Typography>
            <Paper elevation={3} sx={{ padding: "5px" }}>
                <Typography>Supported Minecraft Versions:</Typography>
                <Box sx={{ marginTop: "5px", marginLeft: "0.5rem", display: "flex", gap: "10px" }}>
                    {mc?.map((version,i)=>(
                        <Chip key={i} size="small" label={version} className='btn-square'/>
                    ))}
                </Box>
                <Typography>Supported Mod Loaders:</Typography>
                <Box sx={{ marginTop: "5px", marginLeft: "0.5rem", display: "flex", gap: "10px" }}>
                    {supports?.map((loader,i)=>(
                        <Chip key={i} size="small" label={loader} className='btn-square'/>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}