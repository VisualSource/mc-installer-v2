import {Paper, MenuItem, Avatar, Button} from '@mui/material';
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

export default function Header(){
    const naviagate = useNavigate();
    const [isMaximized,setIsMaximized] = useState<boolean>(false);
    useEffect(()=>{
        const init = async () => {
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        }
        init();
        appWindow.listen("tauri://resize",()=>init());
    },[]);

    return (
        <Paper elevation={2} component="header" square data-tauri-drag-region> 
            <div id="header-appbar" data-tauri-drag-region>
                <ListButton name="File" btnProps={{ size: "small" }}>
                    {({handleClose}: any)=>{
                        return [
                                <MenuItem key={0} onClick={()=>{ handleClose(); naviagate("/"); }}>Home</MenuItem>,
                                <MenuItem key={1} onClick={()=>{ handleClose(); naviagate("/settings"); }}>Settings</MenuItem>,
                                <MenuItem key={2} onClick={()=>{ handleClose(); appWindow.close(); }}>Exit</MenuItem>
                        ];
                    }}
                </ListButton>
                <div id="header-btns-right" data-tauri-drag-region>
                    <ListButton btnProps={{ children: [<DraftsIcon/>], size: "small" }}>
                        {({handleClose}: any)=>{
                            return [
                                <MenuItem key={1} onClick={()=>{ handleClose(); naviagate("/downloads"); }}>Updates</MenuItem>
                            ];
                        }}
                    </ListButton>
                    <div id="header-user">
                        <Avatar variant="square" sx={{ fontSize: 15, bgcolor: "green", width: 31, height: 31 }} children="VS"/>
                        <ListButton name="USERNAME" btnProps={{ sx: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }, variant:"outlined", color: "primary", size: "small", endIcon: <KeyboardArrowDownIcon/> }}>
                            {({handleClose}: any)=>{
                                return [
                                    <MenuItem key={1} onClick={()=>{ handleClose(); naviagate("/settings"); }}>Account</MenuItem>,
                                    <MenuItem key={2} onClick={handleClose}>Logout: USERNAME</MenuItem>
                                   
                                ];
                            }}
                        </ListButton>
                    </div>
                    <Button size="small" onClick={()=>appWindow.minimize()} ><MinimizeIcon/></Button>
                    <Button size="small" onClick={()=>appWindow.toggleMaximize()}>{isMaximized ? <FullscreenExitIcon/> : <FullscreenIcon/>}</Button>
                    <Button size="small" color="error" onClick={()=>appWindow.close()}><CloseIcon/></Button>
                </div>
            </div>
            <div data-tauri-drag-region>
                <Button size="large" component={LinkedButton} to="/cdn/mods">MODS</Button>
                <Button size="large" component={LinkedButton} to="/cdn/modpacks">MOD PACKS</Button>
                <Button size="large" component={LinkedButton} to="/cdn/profiles">PROFILES</Button>
            </div>
        </Paper>
    );
}