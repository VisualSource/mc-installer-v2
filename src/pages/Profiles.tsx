import { Button, Card, CardActions, CardContent, CardHeader, Container, Stack, Typography, Dialog, DialogActions, DialogTitle, DialogContent, TextField, Select, MenuItem, InputLabel, FormControl, DialogContentText, Tooltip, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemButton } from "@mui/material";
import { useState, useEffect } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import Loader from "../components/Loader";
import type { Profile } from "../core/Database";
import AppsIcon from '@mui/icons-material/Apps';

function DeleteDialog({close, open, title, text}: { title: string, text: string, close: ()=>void, open: boolean }){
    return (
        <Dialog open={open} onClose={close}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{text}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} size="small">No</Button>
                <Button onClick={close} size="small" color="warning">Ok</Button>
            </DialogActions>
        </Dialog>
    );
}
function EditDialog({close, open}: { close: ()=>void, open: boolean }){
    return (
        <Dialog open={open} onClose={close}>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Profile name" type="text" fullWidth variant="standard" defaultValue="Default"/>
                    <InputLabel id="mod-loader">Mod Loader</InputLabel>
                    <Select labelId="mod-loader" value={"fabric"} fullWidth>
                    <MenuItem value="fabric">Fabric</MenuItem>
                    <MenuItem value="forge">Forge</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions>
                <Button size="small" onClick={close} color="success">Save</Button>
            </DialogActions>
        </Dialog>
    );
}

function ModListItem({ name, uuid, navigate }: { navigate: NavigateFunction, name: string, uuid: string }){
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar>
                    <AppsIcon htmlColor="white"/>
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={name}/>
            <ListItemButton onClick={()=>navigate(`/mod/${uuid}`)}>View</ListItemButton>
        </ListItem>
    );
}

function ProfileModList({close, open}: { close: ()=>void, open: boolean }){
    const navigate = useNavigate();
    return (
        <Dialog maxWidth="xs" open={open} onClose={close} sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}>
            <DialogTitle>Mod List</DialogTitle>
            <DialogContent dividers>
                <List>
                    <ModListItem name="Mod Name" uuid="UUDIDAEA#EAd" navigate={navigate} />
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}

function ProfileCard({openDelete,openEdit, openDelink, profile, openModlist}: { openModlist: () => void, openDelink: () => void, openEdit: ()=>void,openDelete: ()=>void, profile: Profile }){
    return (
        <Card sx={{marginBottom: "1rem"}}>
            <CardHeader title={profile.name}/>
                <CardContent>
                    <Typography>Minecraft: <span className="profile-version-color">{profile.minecraft_version}</span></Typography>
                    <Typography>Loader: <span className="profile-loader">{profile.loader}</span></Typography>
                    <Typography>Is Modpack: <span className="profile-modpack">{JSON.stringify(profile.is_modpack)}</span></Typography>
                    <Typography>UUID: <code className="profile-uuid">{profile.uuid}</code></Typography>
                </CardContent>
                <CardActions>
                    { profile.can_edit ? <Button onClick={openEdit} size="small">Edit</Button> : null }
                    { profile.can_delete ? <Button onClick={openDelete} size="small" color="error">Delete</Button> : null }
                    <Tooltip title="Remove all mods that are linked to this profile">
                        <Button onClick={openDelink} color="error" size="small">Delink mods</Button>
                    </Tooltip>
                    <Button onClick={openModlist} size="small" color="success">View Linked</Button>
            </CardActions>
        </Card>
    );
}

export default function Profiles(){
    const [openEdit,setOpenEdit] = useState(false);
    const [openDelete,setOpenDelete] = useState(false);
    const [delink,setDelink] = useState(false);
    const [isLoading,setIsLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [modlist,setModList] = useState(false);

    useEffect(()=>{
        const init = async () => {
            const data = await window._profiles.getAllProfiles();
            setProfiles(data);
            setIsLoading(false);
        }
        init();
    },[]);

    const handleDeleteOpen = () => setOpenDelete(true);
    const handleDeleteClose = () => setOpenDelete(false);

    const handleClickOpen = () => setOpenEdit(true);
    const handleClose = () => setOpenEdit(false);

    const openDelink = () => setDelink(true);
    const closeDelink = () => setDelink(false); 

    const openModlist = () => setModList(true);
    const closeModlist = () => setModList(false); 

    if(isLoading) return <Loader/>

    return (
        <Stack direction="column" sx={{ height: "100%", overflowY: "scroll" }}>
            <EditDialog open={openEdit} close={handleClose}/>
            <ProfileModList open={modlist} close={closeModlist}/>
            <DeleteDialog title="Delete profile" text="Are you sure you want to delete this profile?" open={openDelete} close={handleDeleteClose}/>
            <DeleteDialog title="Delinking mods" text="Delinking the mods will uninstall mods that there installed to this profile." open={delink} close={closeDelink}/>
            <Container sx={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
                <Typography variant="h4">Profiles</Typography>
                {profiles.map((data,i)=>{
                    return (<ProfileCard openModlist={openModlist} openDelink={openDelink} openDelete={handleDeleteOpen} openEdit={handleClickOpen} profile={data} key={i} />);
                })}
            </Container>
        </Stack>
    );
}