import { Button, Paper } from '@mui/material';
import { Suspense } from 'react';

import PlayBtn from './PlayBtn';

export default function Footer() {
 
    return (
        <Paper component="footer" id="vs-app-footer" elevation={4}>
            <Suspense fallback={<Button></Button>}>
                <PlayBtn/>
            </Suspense>
        </Paper>
    );
}