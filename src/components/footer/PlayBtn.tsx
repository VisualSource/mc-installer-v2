import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Button } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Login from '@mui/icons-material/Login';
import ErrorIcon from "@mui/icons-material/Error";
import SyncIcon from '@mui/icons-material/Sync';

import { default_profile } from '../../lib/profile';
import { select_profile } from '../../models/SeleteProfile';
import { useAuth } from '../../services/auth';
import { run_game } from '../../lib/commands';

import { running_dialog } from '../../models/RunningDialog';

export default function PlayBtn(){
    const selectedProfile = useRecoilValue(default_profile);
    const openSelect = useSetRecoilState(select_profile);
    const { isLoading, authenicated, error, user } = useAuth();

    return  (
    <Button sx={{ color: "#FFFFFF" }} 
    startIcon={isLoading ? <SyncIcon/> : error ? <ErrorIcon/> : !authenicated ? <Login/> : <PlayArrow/>} 
    color={isLoading ? "primary" : error ? "error" : !authenicated ? "primary" : "success" } 
    variant="contained" 
    onClick={(isLoading || error || !authenicated) ? undefined : selectedProfile?.uuid ?  ()=>{ running_dialog.open(); run_game(user?.xuid as string, selectedProfile.uuid as string);} : ()=>openSelect({ open: true, callback: (uuid) => { console.log(uuid,"Use profile"); } })}>{
        isLoading ? "Loading..." : error ? "Error" : !authenicated ? "Login To Play" : selectedProfile?.uuid ? `Play: ${selectedProfile.name}` : "Play"
    }</Button>);
}