import { Container, Typography, Button, Box, List, ListItem, ListItemText, Chip, MenuItem } from "@mui/material";
import {login_microsoft, login_mojang} from '../../core/cmds';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ListIconButton } from "../ListButton";
import { useState } from "react";


function AccountOptions({ uuid, active, mc }: { mc: boolean, uuid: string, active: boolean }) {
    return (
        <ListIconButton btnProps={{ size: "small", sx: { borderRadius: 0, border: "solid 1px gray" } }} icon={<MoreHorizIcon/>}>
            {({handleClose}: any)=>[ 
                <MenuItem onClick={handleClose} key={0}>Remove Account</MenuItem>,
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

interface Accounts {
    microsoft: {
        active: boolean
        uuid: string;
        email: string;
        username: string;
    }[]
    mojang: {
        active: boolean
        uuid: string;
        email: string;
        username: string;
    }[]
    visualsource: {
        active: boolean
        uuid: string;
        email: string;
        username: string;
    }[]
}

export default function SettingsAccount(){
    let [accounts,setAccounts] = useState<Accounts>({
        microsoft: [{ active: true, uuid: "", email: "boomishere_network@outlook.com", username: "VisaulSource" }],
        mojang: [{active: false, uuid: "", email: "collin_blosser@yahoo.com", username: "VisualSource" }],
        visualsource: [{ active: false, uuid: "", email: "boomishere_network@outlook.com", username: "VisualSource" }]
    });
    return (
        <Container className="add-options" sx={{ overflowY: "scroll", height:"100%", display: "flex", flexDirection: "column", marginTop: "1em", marginBottom: "1em" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Typography variant="h4" >- ACCOUNT -</Typography>
            </Box>
            <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="h5">Microsoft</Typography>
                <List dense sx={{ marginBottom: "10px" }}>
                    {accounts.microsoft.map((value,i)=>(
                        <Account mc username={value.username} email={value.email} active={value.active} uuid={value.uuid}/>
                    ))}
                </List>
                <Button variant="outlined" color="inherit" onClick={login_microsoft}>Add Microsoft Account</Button>
            </Box>
            <Box sx={{ marginTop: "10px", marginBottom: "15px" }}>
                <Typography variant="h5">Mojang</Typography>
                <List dense sx={{ marginBottom: "10px" }}>
                    {accounts.mojang.map((value,i)=>(
                        <Account mc username={value.username} email={value.email} active={value.active} uuid={value.uuid}/>
                    ))}
                </List>
                <Button variant="outlined" color="inherit" onClick={login_mojang}>Add Mojang Account</Button>
            </Box>
            <Box sx={{ marginTop: "10px" }}>
                <Typography variant="h5">VisualSource</Typography>
                <List dense sx={{ marginBottom: "15px" }} >
                    {accounts.visualsource.map((value,i)=>(
                        <Account username={value.username} email={value.email} active={value.active} uuid={value.uuid}/>
                    ))}
                </List>
                <Button variant="outlined" color="inherit">Add VisualSource Account</Button>
            </Box>
        </Container>
    );
}