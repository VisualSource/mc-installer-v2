import { Paper, IconButton, Box, Button, Skeleton } from '@mui/material';
import { Suspense } from 'react';
import { useNavigate, } from 'react-router-dom';
import { appWindow } from '@tauri-apps/api/window';

import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowLeft from '@mui/icons-material/ArrowBack';
import ArrowRight from '@mui/icons-material/ArrowForward';

import { useEffect, useState } from 'react';
import Account from './Account';
import FileBtn from './FileBtn';

function FullscreenButton(){
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    useEffect(()=>{
        appWindow.listen("tauri://resize",async ()=>{
            const maximized = await appWindow.isMaximized();
            setFullscreen(maximized);
        });
    },[]);
    return (
        <IconButton size='small' className='btn-square' onClick={()=>appWindow.toggleMaximize()}>
            {fullscreen ? <FullscreenExitIcon/> : <FullscreenIcon/>}
        </IconButton>
    );
}

function AccountFallback(){
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box sx={{ height: "75%", display: "flex", justifyContent: "center", alignContent: "center" }}>
                <Skeleton animation="wave" width={170} height={34} variant="rectangular"/>
            </Box>
        </Box>
    );
}


export default function Header() {
    const navigate = useNavigate();

    return (
        <Paper id="vs-header-toolbar" elevation={4} component="header" data-tauri-drag-region>
            <Box data-tauri-drag-region id="vs-control-header">
                <FileBtn/> 
                <Box data-tauri-drag-region sx={{ display: "flex" }}>
                    <Suspense fallback={<AccountFallback/>}>
                        <Account/>
                    </Suspense>
                    <IconButton size='small' className='btn-square' onClick={()=>appWindow.minimize()}>
                        <MinimizeIcon/>
                    </IconButton>
                    <FullscreenButton/>
                    <IconButton size='small' className='btn-square close-btn' onClick={()=>appWindow.close()}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </Box>
            <Box data-tauri-drag-region id="vs-sub-header">
                <IconButton className="btn-square" size="small" onClick={()=>navigate(-1)}>
                    <ArrowLeft/>
                </IconButton>
                <IconButton size='small' className='btn-square' onClick={()=>navigate(1)}>
                    <ArrowRight/>
                </IconButton>
                <Button className='btn-square' size="small" onClick={()=>navigate("/list/profiles")}>PROFILES</Button>
                <Button className='btn-square' size="small" onClick={()=>navigate("/list/modpacks")}>MODPACKS</Button>
                <Button className='btn-square' size="small" onClick={()=>navigate("/list/mods")}>MODS</Button>
            </Box>
        </Paper>
    );
}