import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Button } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Login from '@mui/icons-material/Login';
import ErrorIcon from "@mui/icons-material/Error";
import SyncIcon from '@mui/icons-material/Sync';

import { default_profile } from '../../lib/profile';
import { select_profile } from '../../models/SeleteProfile';
import { useAuth } from '../../services/auth';

export default function PlayBtn(){
    const selectedProfile = useRecoilValue(default_profile);
    const openSelect = useSetRecoilState(select_profile);
    const { isLoading, authenicated, error } = useAuth();

    return  (
    <Button sx={{ color: "#FFFFFF" }} 
    startIcon={isLoading ? <SyncIcon/> : error ? <ErrorIcon/> : !authenicated ? <Login/> : <PlayArrow/>} 
    color={isLoading ? "primary" : error ? "error" : !authenicated ? "primary" : "success" } 
    variant="contained" 
    onClick={(isLoading || error || !authenicated) ? undefined : selectedProfile?.uuid ?  ()=>{} : ()=>openSelect(true)}>{
        isLoading ? "Loading..." : error ? "Error" : !authenicated ? "Login To Play" : selectedProfile?.uuid ? `Play: ${selectedProfile.name}` : "Play"
    }</Button>);
}