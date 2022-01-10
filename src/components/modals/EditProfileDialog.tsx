import { Dialog, Slide, Toolbar, IconButton, AppBar, Typography, Button, Container, CircularProgress, Tabs,Tab, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, TextField, FormControl, Tooltip, ListItemButton, InputLabel, Select, MenuItem} from "@mui/material";
import { TransitionProps } from '@mui/material/transitions';
import { useRecoilState } from "recoil";
import { edit_profile_dialog } from "../state/stateKeys";
import {forwardRef, useEffect, useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AppsIcon from '@mui/icons-material/Apps';
import InfoIcon from '@mui/icons-material/Info';
import DB, { Loader, MCVersion, minecraft_loaders, minecraft_verions, ProfileExpand } from "../../core/db";
import { capitalize } from "./AddProfileDialog";
import { useNavigate } from "react-router-dom";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

function LoadingPanal(){
    return (
        <Container sx={{ height:"100%", display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center" }}>
            <CircularProgress/>
        </Container>
    )
}
function ModList({ data, setData }: { data: ProfileExpand, setData: React.Dispatch<React.SetStateAction<ProfileExpand>> }){
    return (
        <Container sx={{ height: "100%" }}>
            <List>
                {data.mods.map((mod,i)=>(
                    <ListItem key={i} secondaryAction={
                        <IconButton onClick={()=>{
                            setData({...data, mods: data.mods.filter(value=>value.uuid !== mod.uuid) })
                        }} sx={{ borderRadius: 0 }} color="error" edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    }>
                         <ListItemAvatar sx={{ minWidth: "30px" }}>
                                <Avatar sx={{ color:"white", borderRadius: 0, width: 24, height: 24 }} src={mod.media.icon ?? undefined}>
                                    <AppsIcon/>
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText>{mod.name}</ListItemText>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}
function Settings({ data, close, setData}: { data: ProfileExpand , setData: React.Dispatch<React.SetStateAction<ProfileExpand>>,  close: ()=>void }){
    const [linkName,setLinkName] = useState<string>("");
    const [linkPath,setLinkPath] = useState<string>("");
    const naviagte = useNavigate();
    return (
        <Container sx={{ height: "100%" }}>
            <FormControl fullWidth>
                <TextField value={data.name} onChange={event=>setData({...data, name: event.target.value})} label="Profile name" margin="dense" type="text" variant="standard" autoFocus id="name"/>
            </FormControl>
            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <Box sx={{display:"flex", alignContent: "center", alignItems: "center" }}>
                        <Typography variant="h6">Media</Typography>
                        <Tooltip title={(<>
                            <Typography variant="h6">List image:</Typography>
                            <Typography variant="body2">This is the image that is display when look at the list of all the profiles</Typography>
                            <Typography variant="h6">Icon:</Typography>
                            <Typography variant="body2">This is the small icon used in small lists</Typography>
                            <Typography variant="h6">Background Image:</Typography>
                            <Typography variant="body2">This is the image that is show in the header of the profiles info page.</Typography>
                        </>)}>
                            <IconButton>
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <TextField value={data.media.list ?? ""} onChange={event=>setData({ ...data, media: { ...data.media, list: event.target.value } })} label="List image" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={data.media.icon ?? ""} onChange={event=>setData({ ...data, media: { ...data.media, icon: event.target.value } })} label="Icon" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={data.media.background ?? ""} onChange={event=>setData({ ...data, media: { ...data.media, background: event.target.value } })} label="Background image" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={data.category} onChange={event=>setData({ ...data, category: event.target.value })} label="Category" margin="dense" type="text" variant="standard" autoFocus id="category"/>
                    <TextField value={data.description} onChange={event=>setData({ ...data, description: event.target.value })} id="description" label="Description" multiline rows={4} variant="standard"/>
                </FormControl>
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <Typography variant="h6">Links</Typography>
                    <Box sx={{ width: "100%", display: "flex"}}>
                        <TextField value={linkName} onChange={event=>setLinkName(event.target.value)} fullWidth label="Link name" margin="dense" type="text" variant="standard" autoFocus id="link_name"/>
                        <TextField value={linkPath} onChange={event=>setLinkPath(event.target.value)} fullWidth label="Link path" margin="dense" type="url" variant="standard" autoFocus id="path"/>
                    </Box>
                    <Button sx={{ marginTop: "10px" }} variant="contained" onClick={()=>{
                        setData({...data, links: [...data.links, { path: linkPath, name: linkName }] });
                        setLinkName("");
                        setLinkPath("");
                    }}>Add</Button>
                    <List>
                        {data.links.map((link,i)=>(
                            <ListItem key={i} secondaryAction={
                                <IconButton onClick={()=>{
                                    setData({...data, links: data.links.filter((_,key)=>key!==i) });
                                }}sx={{ borderRadius: 0 }} color="error" edge="end" aria-label="delete">
                                 <DeleteIcon />
                                </IconButton>
                            }>
                            <ListItemButton component="a" href={link.path} target="_blank">
                                {link.name}
                            </ListItemButton>
                        </ListItem>
                        ))}
                    </List>
                </FormControl>
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <Box sx={{display:"flex", alignContent: "center", alignItems: "center" }}>
                        <Typography variant="h6">Minecraft</Typography>
                        <Tooltip title={(<>
                            <Typography>Changing any of these props will clear mods</Typography>
                            <Typography variant="h6">Minecraft:</Typography>
                            <Typography variant="body2">The minecraft version that this profile uses. Ex minecraft 1.18.1</Typography>
                            <Typography variant="h6">Loader:</Typography>
                            <Typography variant="body2">This is the common mod loader that handles the loading of minecraft mods into the game.</Typography>
                        </>)}>
                            <IconButton>
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <FormControl sx={{ marginTop: "10px" }}>
                        <InputLabel id="profile-mc">Minecraft</InputLabel>
                        <Select onChange={event=>setData({...data, mc: event.target.value as MCVersion, mods: []})} value={data.mc} label="Minecraft" labelId="profile-mc" id="mc">
                            {minecraft_verions.map((version,i)=>(
                                <MenuItem value={version} key={i}>{version}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ marginTop: "10px", marginBottom: "10px" }}>
                        <InputLabel id="profile-loader">Loader</InputLabel>
                        <Select onChange={event=>setData({...data, loader: event.target.value as Loader, mods: []})} value={data.loader} label="Loader" labelId="profile-loader" id="loader">
                            {minecraft_loaders.map((value,i)=>(
                                <MenuItem value={value} key={i}>{capitalize(value)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {data.can_delete ? <Button onClick={()=>{
                        new DB().deleteProfile(data.uuid);
                        naviagte("/cdn/profiles");
                        close();
                    }} sx={{marginBottom: "25px"}} color="error" variant="contained" fullWidth startIcon={<DeleteIcon/>}>Delete</Button> : null }
                </FormControl>
        </Container>
    );
}

function Panel(props: { setData: React.Dispatch<React.SetStateAction<ProfileExpand | null>>, close:()=>void,index: number, data: ProfileExpand | null, loading: boolean }) {
    const naviagte = useNavigate();
    if(props.loading) return <LoadingPanal/>
    if(!props.data || !props.data.can_edit) return (
        <Container sx={{ height:"100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", alignContent: "center" }}>
            <Typography>This Profile can not be edited</Typography>
            {props.data && props.data.can_delete ? <Button onClick={()=>{
                        if(props.data){
                            new DB().deleteProfile(props.data.uuid);
                            naviagte("/cdn/profiles");
                        }
                        props.close();
                    }} sx={{marginTop: "25px"}}  color="error" variant="contained" fullWidth startIcon={<DeleteIcon/>}>Delete</Button> : null }
        </Container>
    );
    switch (props.index) {
        case 0:
            return <Settings setData={props.setData as React.Dispatch<React.SetStateAction<ProfileExpand>>} close={props.close} data={props.data}/>;
        default:
            return <ModList setData={props.setData as React.Dispatch<React.SetStateAction<ProfileExpand>>} data={props.data}/>;
    }
}

export default function EditProfileDialog(){
    const naviagte = useNavigate();
    const [profile,setProfile] = useRecoilState(edit_profile_dialog);
    const [data,setData] = useState<ProfileExpand|null>(null);
    const [loading,setLoading] = useState<boolean>(true);
    const [panel,setPanel] = useState<number>(0);
    const handleClose = () => setProfile({show: false, profile: null});

    const save = async () => {
        if(!data) return;
        if(!data.can_edit) return handleClose();
        await new DB().updateProfile(data.uuid,{
            mc: data.mc,
            media: data.media,
            mods: data.mods.map(value=>value.uuid),
            links: data.links,
            description: data.description,
            name: data.name,
            loader: data.loader
        });
        naviagte("/cdn/profiles");
        naviagte(`/cdn/profile/${data.uuid}`);
        handleClose();
    }

    useEffect(()=>{
        const load = async()=>{
            try {
                if(!profile.profile) throw new Error("Invaild profile uuid");
                const db = new DB();
                const content = await db.getProfile(profile.profile);
                if(!content) throw new Error("Profile is null");
                setData(content);
                setLoading(false);
            } catch (error) {
                setData(null);
                setLoading(false);
            }
        }
        load();
    },[profile.profile])

    return (
        <Dialog fullScreen open={profile.show} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar sx={{ position: 'relative' }} data-tauri-drag-region>
                <Toolbar data-tauri-drag-region>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div" data-tauri-drag-region>
                        Edit Profile
                    </Typography>
                    <Button startIcon={<SaveIcon/>} autoFocus color="success" onClick={save}>
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={panel} onChange={(_,value)=>setPanel(value)}>
                    <Tab label="Settings" />
                    <Tab label="Mods" />
                </Tabs>
            </Box>
            <Panel close={handleClose} data={data} setData={setData} loading={loading} index={panel} />
        </Dialog>
    );
}