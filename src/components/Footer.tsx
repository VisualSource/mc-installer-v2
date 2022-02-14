import { Paper, Button } from '@mui/material';
import { useRecoilValue } from 'recoil';
import PlayArrow from '@mui/icons-material/PlayArrow';

import { default_profile } from '../lib/profile';

export default function Footer() {
    const selectedProfile = useRecoilValue(default_profile);
    return (
        <Paper component="footer" id="vs-app-footer" elevation={4}>
            <Button sx={{ color: "#FFFFFF" }} startIcon={<PlayArrow/>} color="success" variant="contained">Play: {selectedProfile.name}</Button>
        </Paper>
    );
}