import { useState, useEffect, useRef } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Button, Typography, LinearProgress, Paper, Box , Divider } from '@mui/material';
import Draggable from 'react-draggable';

import { GameLaunchStatus, is_game_running } from '../lib/commands';

interface DialogStatus {
    type: "ok" | "update" | "error",
    data: any
}

interface DialogController {
    _open: boolean,
    _liseners: ((event: boolean)=> void)[],
    open: () => void,
    on: (callback: (value: boolean) => void) => void;
    off: () => void,
}

export const running_dialog: DialogController = {
    _open: false,
    _liseners: [],
    open: () => {
        running_dialog._open = true;
        running_dialog._liseners.forEach(callback=>{
            callback(running_dialog._open);
        });
    },
    on: (callback: (value: boolean) => void ) => {
        running_dialog._liseners.push(callback);
    },
    off: () => {
        running_dialog._liseners = [];
    },
}

function MinecraftRunningStatus({ setOpen }: {setOpen: (value: boolean) => void }){

    useEffect(()=>{
        const check_status = setInterval( async ()=>{
            const status = await is_game_running();
            if(!status) setOpen(false);
        },2000);

        return () => {
            clearInterval(check_status);
        }
    },[]);

    return (
        <Box sx={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Typography>Minecraft is running</Typography>
        </Box>
    );
}

export default function RunningDialog() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [state,setState] = useState<boolean>(false);
    const [status, setData] = useState<DialogStatus>({ type: "update", data: { task: 0, msg: "Loading" } });

    useEffect(()=>{ 
        running_dialog.on((event: boolean)=>{
            setState(event);
        });
        appWindow.listen<{ task: number, msg: string }>(GameLaunchStatus.Progress,(event)=>{
            console.log(event);
            setData({ type: "update", data: event.payload });
        });
        appWindow.listen<string>(GameLaunchStatus.Error, (event)=>{
            console.log(event);
            setData({ type: "error", data: { error: event.payload } });
        });
        appWindow.listen(GameLaunchStatus.Ok,(event)=>{
            console.log(event);
            setData({ type: "ok", data: {} });
        });

        return () => {
            running_dialog.off();
        }
    },[]);

    const handleClose = () => setState(false);

    if(!state) return null;
    return (
        <Draggable 
        defaultPosition={{x: (window.innerWidth / 2) - 150 ,y: 0 }} 
        nodeRef={ref} 
        bounds={{ 
            left: 0, 
            top: -(window.innerHeight / 2), 
            bottom: (window.innerHeight / 2) - 200, 
            right: window.innerWidth - 400 }}>
            <Paper id="running-dialog" ref={ref} sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ marginLeft: "0.5rem" }} variant='h6'>Running</Typography>
                <Divider/>
                <Box sx={{ height: "100%" }}>
                    { status.type === "update" ? (
                    <Box sx={{ width: "90%", display: "flex", flexDirection: "column", marginTop: "1rem", marginLeft: "auto", marginRight: "auto" }}>
                        <Typography sx={{ marginBottom: "0.5rem" }} variant="body2">Task {status.data.task} of 4: {status.data.msg}</Typography>
                        <LinearProgress sx={{ height: "20px", width: "100%" }} variant="determinate" color="inherit" value={status.data.task / 0.04 }/>
                    </Box>
                    ) : status.type === "error" ? (
                    <Box sx={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography variant='h5'>There was an eror</Typography>
                        <Typography variant='body2'>{status.data.error}</Typography>
                    </Box>
                    ) :(
                    <MinecraftRunningStatus setOpen={setState}/>
                    )}
                </Box>
                <Box sx={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={handleClose} color="error">Exit Game</Button>
                </Box>
            </Paper>
        </Draggable>
    );

  /*  return (
        <Dialog open={state} fullWidth disableEscapeKeyDown id="running-dialog">
            <DialogTitle>Running</DialogTitle>
            <DialogContent>
                {
                    status.type === "update" ? (
                        <>
                            <Typography sx={{ marginBottom: "15px" }}>{status.data.msg}</Typography>
                            <LinearProgress sx={{ height: "5px" }} variant="buffer" valueBuffer={0} value={status.data.progress} />
                        </>
                    ) : status.type === "error" ? (
                    <>
                    
                    </>) : (<Typography>Minecraft is running</Typography>)
                }
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={handleClose}>Stop</Button>
            </DialogActions>
        </Dialog>
    );*/
}