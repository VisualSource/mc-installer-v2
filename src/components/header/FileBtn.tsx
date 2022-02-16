import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useState } from 'react';

import DownloadsIcon from '@mui/icons-material/FileDownloadSharp';
import SettingsIcon from "@mui/icons-material/Settings";

export default function FileBtn(){
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Button className='btn-square' size="small" onClick={handleClick}>File</Button>
            <Menu open={open} onClose={handleClose} anchorEl={anchorEl} sx={{ padding: 0, width: 320, maxWidth: '100%' }} elevation={2}>
                <MenuItem>
                    <ListItemIcon>
                         <DownloadsIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Downloads</ListItemText>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}