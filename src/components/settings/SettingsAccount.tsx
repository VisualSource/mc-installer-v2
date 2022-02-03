import { Container, Typography, Button, Box, List, ListItem, ListItemText, Chip, MenuItem } from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ListIconButton } from "../ListButton";
import { useState, useEffect } from "react";
import Accounts, {MSAccount} from '../../core/accounts';
import { useRecoilState } from 'recoil';
import {active_user} from '../state/stateKeys';

function AccountOptions({ uuid, active, mc, logout ,setActive }: {setActive: (uuid: string)=> Promise<void>, logout: (uuid: string)=> Promise<void> , mc: boolean, uuid: string, active: boolean }) {
    return (
        <ListIconButton btnProps={{ size: "small", sx: { borderRadius: 0, border: "solid 1px gray" } }} icon={<MoreHorizIcon/>}>
            {({handleClose}: any)=>[ 
                <MenuItem onClick={()=>{logout(uuid); handleClose();}} key={0}>Remove Account</MenuItem>,
                <MenuItem onClick={handleClose} key={1}>Manage account</MenuItem>,
                mc && !active ? <MenuItem onClick={()=>{setActive(uuid); handleClose();}} key={2}>Set as active</MenuItem> : null
            ]}
        </ListIconButton>
    );
}
function Account({ uuid, username, email, logout, setActive, active = false, mc = false }: {setActive: (uuid: string)=> Promise<void>, logout: (uuid: string)=> Promise<void>, mc?: boolean, uuid: string, username: string, email: string, active?: boolean }) {
    return (
        <ListItem sx={{ borderBottom: "solid 1px gray"}} secondaryAction={<AccountOptions setActive={setActive} logout={logout} mc={mc} uuid={uuid} active={active}/>}>
            <ListItemText primary={
                <Box sx={{ display: "flex", alignContent: "center", alignItems: "center" }}>
                <Typography>{username}</Typography>
                { active ? <Chip sx={{ marginLeft: "10px", borderRadius: "6px", color: "white" }} size="small" color="success" label="ACTIVE"/> : null }
                </Box>} secondary={email} />
        </ListItem>
    );
}

export default function SettingsAccount(){
    const [msa,setMsa] = useState<MSAccount[]>([]);
    const [activeUser,setActiveUser] = useRecoilState(active_user);
    const [auth,_] = useState({ isAuth: true,  user: { sub: "", username: "VisualSource", email: "boomishere_network@outlook.com" } });

    const ms_login = async () => {
        try {
            const data = await new Accounts().addAccount();
            setMsa(data);
        } catch (error) {
            console.error(error);
        }
    }

    const ms_logout = async (uuid: string) => {
        try {
            const data = await new Accounts().removeAccount(uuid);
            setMsa(data);
        } catch (error) {
            console.error(error);
        }
    }

    const set_active = async (uuid: string) => {
        try {
            const data = new Accounts().setActive(uuid);
            setActiveUser(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=>{
        const init = async () => {
            let acc = new Accounts();
            const data = await acc.getAccounts();
            setMsa(data);
        }
        init();
    },[]);

    return (
        <Container className="add-options" sx={{ overflowY: "scroll", height:"100%", display: "flex", flexDirection: "column", marginTop: "1em", marginBottom: "1em" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}> 
                <Typography variant="h4" >- ACCOUNT -</Typography>
            </Box>
            <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="h5">Microsoft</Typography>
                <List dense sx={{ marginBottom: "10px" }}>
                    {Object.values(msa).map((value,i)=>(
                        <Account setActive={set_active} logout={ms_logout} mc username={value.profile.name} email={value.profile.name} active={value.profile.id === activeUser} uuid={value.profile.id}/>
                    ))}
                </List>
                <Button variant="outlined" color="inherit" onClick={ms_login}>Add Microsoft Account</Button>
            </Box>
            <Box sx={{ marginTop: "10px" }}>
                <Typography variant="h5">VisualSource</Typography>
                <List dense sx={{ marginBottom: "15px" }} >
                    {
                        auth.isAuth ? <Account setActive={async(i)=>{}} logout={async(i)=>{}} username={auth.user.username} email={auth.user.email} active={false} uuid={auth.user.sub}/> : null
                    }
                </List>
                <Button variant="outlined" color="inherit">Login to Account</Button>
            </Box>
        </Container>
    );
}