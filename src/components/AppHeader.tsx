import {useState} from 'react';
import { Tooltip, Button, Menu, MenuItem, Paper, Typography } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import {useNavigate} from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';

  export default function BasicMenu() {
    const naviagate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    return (
        <Paper elevation={2} square data-tauri-drag-region id="titlebar">
            <Button
            id="options-btn"
            aria-controls="basic-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            >
                <MenuIcon color="action"/>
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}>
                <MenuItem onClick={()=>{handleClose(); naviagate("/profiles")}}>
                  <CollectionsBookmarkIcon sx={{marginRight: "5px" }}/> 
                  <Typography variant="body2" color="text.secondary">Profiles</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <AccountCircleIcon sx={{marginRight: "5px" }}/> 
                  <Typography variant="body2" color="text.secondary">Account</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <LogoutIcon sx={{marginRight: "5px" }}/> 
                  <Typography variant="body2" color="text.secondary">Logout</Typography>
                </MenuItem>
                <MenuItem onClick={()=>{handleClose(); naviagate("/settings")}}>
                  <SettingsIcon sx={{marginRight: "5px" }}/> 
                  <Typography variant="body2" color="text.secondary">Settings</Typography>
                </MenuItem>
            </Menu>
           <div>
                <Tooltip title="minimize">
                  <Button onClick={()=>appWindow.minimize()}>
                    <MinimizeIcon color="action"/>
                  </Button>
                </Tooltip>
                <Tooltip title="maximize">
                  <Button onClick={()=>appWindow.toggleMaximize()}>
                    <FullscreenIcon color="action"/>
                  </Button>
                </Tooltip>
                <Tooltip title="close">
                  <Button onClick={()=>appWindow.close()}>
                    <CloseIcon color="error"/>
                  </Button>
               </Tooltip>
           </div>
        </Paper>
    );
  }