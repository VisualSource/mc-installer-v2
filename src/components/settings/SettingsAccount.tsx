import { Container, Typography, Button, Box, List, ListItem, ListItemText, Chip, MenuItem } from "@mui/material";
import { login_microsoft, logout_microsoft } from '../../core/cmds';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ListIconButton } from "../ListButton";
import { useState } from "react";
import { ms_accounts } from '../state/stateKeys';
import { useRecoilState } from "recoil";

function AccountOptions({ uuid, active, mc }: { mc: boolean, uuid: string, active: boolean }) {
    return (
        <ListIconButton btnProps={{ size: "small", sx: { borderRadius: 0, border: "solid 1px gray" } }} icon={<MoreHorizIcon/>}>
            {({handleClose}: any)=>[ 
                <MenuItem onClick={()=>{logout_microsoft(); handleClose();}} key={0}>Remove Account</MenuItem>,
                <MenuItem onClick={handleClose} key={1}>Manage account</MenuItem>,
                mc && !active ? <MenuItem onClick={handleClose} key={2}>Set as active</MenuItem> : null
            ]}
        </ListIconButton>
    );
}
function Account({ uuid, username, email, active = false, mc = false }: { mc?: boolean, uuid: string, username: string, email: string, active?: boolean }) {
    return (
        <ListItem sx={{ borderBottom: "solid 1px gray"}} secondaryAction={<AccountOptions mc={mc} uuid={uuid} active={active}/>}>
            <ListItemText primary={
                <Box sx={{ display: "flex", alignContent: "center", alignItems: "center" }}>
                {username} 
                { active ? <Chip sx={{ marginLeft: "10px", borderRadius: "6px", color: "white" }} size="small" color="success" label="ACTIVE"/> : null }
                </Box>} secondary={email} />
        </ListItem>
    );
}

export default function SettingsAccount(){
    const [msa,setMSA] = useRecoilState(ms_accounts);
    const [auth,_] = useState({ isAuth: true,  user: { sub: "", username: "VisualSource", email: "boomishere_network@outlook.com" } });

    const ms_login = async () => {
        try {
            const user =  await login_microsoft();
            if(!user) throw new Error("Login failed");
            setMSA([...msa,user]);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container className="add-options" sx={{ overflowY: "scroll", height:"100%", display: "flex", flexDirection: "column", marginTop: "1em", marginBottom: "1em" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}> 
                <Typography variant="h4" >- ACCOUNT -</Typography>
            </Box>
            <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="h5">Microsoft</Typography>
                <List dense sx={{ marginBottom: "10px" }}>
                    {msa.map((value,i)=>(
                        <Account mc username={value.username} email={value.email} active={value.active} uuid={value.uuid}/>
                    ))}
                </List>
                <Button variant="outlined" color="inherit" onClick={ms_login}>Add Microsoft Account</Button>
            </Box>
            <Box sx={{ marginTop: "10px" }}>
                <Typography variant="h5">VisualSource</Typography>
                <List dense sx={{ marginBottom: "15px" }} >
                    {
                        auth.isAuth ? <Account username={auth.user.username} email={auth.user.email} active={false} uuid={auth.user.sub}/> : null
                    }
                </List>
                <Button variant="outlined" color="inherit">Login to Account</Button>
            </Box>
        </Container>
    );
}