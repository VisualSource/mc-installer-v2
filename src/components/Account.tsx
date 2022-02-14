import { Box, Avatar, Button, MenuItem, Menu, Divider, ListItemIcon } from "@mui/material";
import React, { useState } from 'react';
import ArrowDown from "@mui/icons-material/ArrowDropDown";
import Login from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';

import { useAuth } from '../services/auth';

export default function Account() {
    const { authenicated, user, login, logout } = useAuth();
    const [anchorEl,setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box sx={{ height: "75%", display: "flex", justifyContent: "center", alignContent: "center" }}>
                <Avatar className='btn-square' sx={{ color: "white", height: "28px", width: "28px", borderRight: "4px solid #004a86" }}/>
                <Button sx={{ height: "28px", color: "#FFFFFF" }} disableElevation variant="contained" endIcon={<ArrowDown/>} className='btn-square' onClick={handleClick}>{user?.profile.name ?? "USERNAME"}</Button>
            </Box>
            <Menu id="vs-account-menu" anchorEl={anchorEl} open={open} onClose={handleClose} 
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                    }
                }}>
                <MenuItem>
                    <Avatar sx={{ color: "white" }}/> Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={()=>{
                    if(authenicated) logout(); else login();
                    handleClose();
                }}>
                    <ListItemIcon>
                        {authenicated ?  <Logout fontSize="small"/> : <Login fontSize="small"/> }
                    </ListItemIcon>
                    {authenicated ? "Logout" : "Login"}
                </MenuItem>
            </Menu>
        </Box>
    );
}