import { AppBar, Toolbar, IconButton, Box, Button } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Header() {
    return (
        <Box component="header">
            <AppBar>
                <Toolbar variant="dense" id="vs-header-toolbar">
                    <Box data-tauri-drag-region>
                        <Button className='btn-square' size="small">File</Button>
                        <Box>
                            <IconButton size='small' className='btn-square close-btn' onClick={()=>appWindow.close()}>
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                    </Box>
                    <Box data-tauri-drag-region>
                        <Button className='btn-square' size="small">PROFILES</Button>
                        <Button className='btn-square' size="small">MODPACKS</Button>
                        <Button className='btn-square' size="small">MODS</Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}