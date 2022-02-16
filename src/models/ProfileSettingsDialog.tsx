import { atom, useRecoilState } from 'recoil';
import { useQuery, useMutation } from 'react-query';
import { dialog } from '@tauri-apps/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItemButton, ListItemAvatar, Avatar, ListItem, ListItemText, IconButton } from '@mui/material';
import { useState } from 'react';

import { MinecraftProfile, Database } from '../lib/db';

import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import PickFile from '../components/PickFile';

import AppsIcon from '@mui/icons-material/Apps';
import DeleteIcon from '@mui/icons-material/Delete';

import { default_profile } from '../lib/profile';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
interface ProfileSettings {
    open: boolean;
    profile: string | undefined;
}

export const settings_profile = atom<ProfileSettings>({
    key: "edit_profile_settings",
    default: {
        open: false,
        profile: ""
    }
});

function TabPanel({ id, tab, children }: { id: number, tab: number, children: any }) {
    if(id === tab) {
        return children;
    }
    return null;
}

export default function ProfileSettingsDialog() {
    const navigate = useNavigate();
    const mutation = useMutation(({ data, event }:{ data: any, event: "update" | "delete" })=>Database.profileEdit(data,event));
    const [state, setState] = useRecoilState(settings_profile);
    const [defaultProfile, setDefaultProfile] = useRecoilState(default_profile);
    const { data, error, isLoading } = useQuery<MinecraftProfile,Error>(["ViewProfile",state?.profile],()=>Database.getItem(state.profile), { enabled: !!state?.profile });
    const [tab, setTab] = useState<number>(0);

    const changeTab = (_event: React.SyntheticEvent, value: number) => setTab(value);

    const handleClose = () => setState({ ...state, open: false });

    const deleteProfile = async () => {
        const confirm = await dialog.confirm("Are you sure you want to do this. It can't be undone.", "Delete?");
        if(!confirm) return;
        const deletion = mutation.mutateAsync({ data: { uuid: data?.uuid, data: null }, event: "delete" });
        await toast.promise(deletion, {
            loading: "Pending...",
            error: "Failed to delete profile",
            success: "Deleted Profile"
        });
        navigate("/list/profiles");
        handleClose();
    }
   
    const submit = () => {}
    return (
        <Dialog open={state.open} onClose={handleClose} scroll="paper" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
                {isLoading ? <Loader/> : error ? <ErrorMessage message={error.message}/>: (
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tab} onChange={changeTab}>
                            <Tab label="General"></Tab>
                            <Tab label="Advanced"></Tab>
                            <Tab label="Mods"></Tab>
                            <Tab label="Media"></Tab>
                            <Tab label="Other"></Tab>
                        </Tabs>
                    </Box>
                    <TabPanel id={0} tab={tab}>
                        <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                            <FormControl fullWidth>
                                <TextField name="name" defaultValue={data?.name} label="Name"></TextField>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                <TextField name="category" defaultValue={data?.category} label="Category"></TextField>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                <InputLabel id="minecraft-modloader">ModLoader</InputLabel>
                                <Select name="loader" defaultValue={data?.loader} labelId='minecraft-modloader'>
                                    <MenuItem value="vanilla">Vanilla</MenuItem>
                                    <MenuItem value="optifine">OptiFine</MenuItem>
                                    <MenuItem value="forge">Forge</MenuItem>
                                    <MenuItem value="fabric">Fabric</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                <InputLabel id="minecraft-version">Minecraft</InputLabel>
                                <Select name="minecraft" defaultValue={data?.minecraft} labelId='minecraft-version'>
                                    <MenuItem value="1.18.1">1.18.1</MenuItem>
                                    <MenuItem value="1.17.1">1.17.1</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </TabPanel>
                    <TabPanel id={1} tab={tab}>
                        <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                            <FormControl fullWidth>
                                <TextField defaultValue={data?.jvm_args} name="jvm_args" label="JVM Arguments"/>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                <InputLabel id="modloader-version">ModLoader Version</InputLabel>
                                <Select labelId='modloader-version'>
                                    <MenuItem>HD_U4_H</MenuItem>
                                </Select>
                            </FormControl>
                            <PickFile sx={{ marginTop: "10px" }} label="Game Dir" defaultValue={data?.dot_minecraft ?? ".minecraft"} btnText="Open Dir"/>
                            <PickFile sx={{ marginTop: "10px" }} label="Java Exec" defaultValue={data?.java ?? "Bundled Runtime"}/>
                        </Box>
                    </TabPanel>
                    <TabPanel id={2} tab={tab}>
                        <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                            <List dense>
                                <ListItem secondaryAction={
                                    <IconButton edge="end">
                                        <DeleteIcon color="error"/>
                                    </IconButton>
                                }>
                                    <ListItemButton>
                                        <ListItemAvatar>
                                            <Avatar sx={{ color: "#FFFFFF" }} className="btn-square">
                                                <AppsIcon/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary="MODNAME"/>
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                    </TabPanel>
                    <TabPanel id={3} tab={tab}>
                        <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                <TextField defaultValue={data?.media.icon} label="Icon"></TextField>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                <TextField defaultValue={data?.media.banner} label="Banner"></TextField>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                <TextField defaultValue={data?.media.card} label="Card"></TextField>
                            </FormControl>
                            <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
                                    <TextField sx={{ width: "75%", marginRight: "15px" }} type="url" label="Url"></TextField>
                                    <Button variant="contained" color="success">Add Link</Button>
                                </Box>
                                <List dense>
                                    <ListItem secondaryAction={<IconButton edge="end"><DeleteIcon color="error"/></IconButton>}>
                                        <ListItemButton href={"#route"} target="_blank">Link</ListItemButton>
                                    </ListItem>
                                </List>
                            </FormControl>
                        </Box>
                    </TabPanel> 
                    <TabPanel id={4} tab={tab}>
                        <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                            <Button variant="contained" color="error" onClick={deleteProfile}>Delete</Button>
                            <Button onClick={()=>setDefaultProfile(defaultProfile.uuid === state.profile ? { uuid: undefined, name: undefined } : { uuid: data?.uuid, name: data?.name })} variant="contained" sx={{ marginTop: "10px" }}>{defaultProfile.uuid === state.profile ? "Remove as default" : "Set as default"}</Button>
                        </Box>
                    </TabPanel>
                </>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={handleClose}>Cancel</Button>
                <Button color="success" onClick={submit}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}