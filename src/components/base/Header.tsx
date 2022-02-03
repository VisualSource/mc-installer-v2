import {Paper, MenuItem, Avatar, Button, IconButton, Divider, Box } from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DraftsIcon from '@mui/icons-material/Drafts';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { useNavigate } from 'react-router-dom';
import{ LinkedButton } from '../LinkedButton';
import ListButton from '../ListButton';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';
import Accounts from '../../core/accounts';
import { useRecoilValue } from 'recoil';
import { active_user } from '../state/stateKeys';

export default function Header(){
    const naviagate = useNavigate();
    const [isMaximized,setIsMaximized] = useState<boolean>(false);
    const [user,setUser] = useState<string>("USERNAME");
    const active = useRecoilValue(active_user);

    useEffect(()=>{
        const init = async () => {
            const data = await new Accounts().getUser(active);
            if(data) {
                setUser(data.profile.name);
            } else {
                setUser("USERNAME");
            }
        }
        init();
    },[active]);


    useEffect(()=>{
        const init = async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        }
        init();
        appWindow.listen("tauri://resize",()=>init());
    },[]);

    return (
        <Paper elevation={2} component="header" square data-tauri-drag-region id="app-header"> 
            <Box data-tauri-drag-region id="app-header-controls">
                <ListButton name="File" btnProps={{ size: "small", sx: { borderRadius: 0} }}>
                    {({handleClose}: any)=>[
                            <MenuItem key={0} onClick={()=>{ handleClose(); naviagate("/"); }}>Home</MenuItem>,
                            <Divider key={1}/>,
                            <MenuItem key={2} onClick={()=>{ handleClose(); naviagate("/settings"); }}>Settings</MenuItem>,
                            <Divider key={3}/>,
                            <MenuItem key={4} onClick={()=>{ handleClose(); appWindow.close(); }}>Exit</MenuItem>
                        ]
                    }
                </ListButton>
                <Box data-tauri-drag-region id="app-header-userinfo">
                    <ListButton btnProps={{ sx: { borderRadius: 0, marginRight: "20px" }, children: [<DraftsIcon key={0}/>], size: "small" }}>
                        {({handleClose}: any)=> [
                                <MenuItem key={1} onClick={()=>{ handleClose(); naviagate("/downloads"); }}>Updates</MenuItem>
                            ]
                        }
                    </ListButton>
                    <Box id="app-header-acccount-select">
                        <Avatar variant="square" sx={{ color: "white", width: 31, height: 31 }}/>
                        <ListButton name={user} btnProps={{ sx: { borderRadius: 0  }, variant:"outlined", color: "primary", size: "small", endIcon: <KeyboardArrowDownIcon/> }}>
                            {({handleClose}: any)=> [
                                <MenuItem key={1} onClick={()=>{ handleClose(); naviagate("/settings"); }}>Accounts</MenuItem>,
                                <Divider key={3}/>,
                                <MenuItem key={2} onClick={()=>{ new Accounts().removeAccount(active ?? ""); handleClose();}}>Logout: {user}</MenuItem>
                                   
                            ]}
                        </ListButton>
                    </Box>
                    <IconButton color="primary" sx={{ borderRadius: 0, marginLeft: "25px" }} onClick={()=>appWindow.minimize()} size="small">
                        <MinimizeIcon/>
                    </IconButton>
                    <IconButton color="primary" sx={{ borderRadius: 0 }} onClick={()=>appWindow.toggleMaximize()} size="small">
                        {isMaximized ? <FullscreenExitIcon/> : <FullscreenIcon/>}
                    </IconButton>
                    <IconButton color="error" sx={{ borderRadius: 0 }} onClick={()=>appWindow.close()} size="small">
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </Box>
            <Box data-tauri-drag-region>
                <Button size="large" isactivelink component={LinkedButton} to="/cdn/mods">MODS</Button>
                <Button size="large" isactivelink component={LinkedButton} to="/cdn/modpacks">MOD PACKS</Button>
                <Button size="large" isactivelink component={LinkedButton} to="/cdn/profiles">PROFILES</Button>
            </Box >
        </Paper>
    );
}