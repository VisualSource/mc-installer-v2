import { atom, useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { dialog } from '@tauri-apps/api';
import { Dialog, DialogTitle, DialogContent, Tab, Tabs, ListItemButton, ListItem, IconButton, DialogActions, Button, TextField, FormControl, Select, List, MenuItem, InputLabel, Typography, Box } from '@mui/material';
import { useReducer, useState } from 'react';

import type { Loader, Media } from '../lib/db';
import { get_loader_versions, get_minecraft_versions } from '../lib/commands';
import PickFile from '../components/PickFile';

import AppsIcon from '@mui/icons-material/Apps';
import DeleteIcon from '@mui/icons-material/Delete';

export const create_profile = atom({
    key: "create_profile",
    default: false
}); 
interface FormState {
    name: string;
    minecraft: string,
    category: string,
    loader: Loader,
    loader_version: string | null,
    java: string | null,
    dot_minecraft: string | null,
    jvm_args: string;
    media: Media,
    resolution: {
        width: number,
        height: number
    } | null
}

function TabPanel({ id, tab, children }: { id: number, tab: number, children: any }) {
    if(id === tab) {
        return children;
    }
    return null;
}

const formDefaultState: FormState = {
    name: "Minecraft",
    category: "General",
    minecraft: "latest-release",
    loader: "vanilla",
    loader_version: null,
    dot_minecraft: null,
    java: null,
    media: {
        links: [],
        icon: null,
        card: null,
        banner: null
    },
    resolution: null,
    jvm_args: "-Xmx2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M"
}

const formReducer = (state: FormState, action: { type: "remove_link" | "icon" | "card" | "banner" | "resolution_height" | "resolution_width" | "add_link" | "dot_minecraft" | "reset" | "name" | "category" | "minecraft" | "loader" | "loader_version" | "java" | "jvm_args", payload: any }) => {
    switch (action.type) {
        case "category":
            return { ...state, category: action.payload };
        case "java": 
            return { ...state, java: action.payload };
        case "jvm_args":
            return { ...state, jvm_args: action.payload };
        case "loader":
            return { ...state, loader: action.payload };
        case "loader_version":
            return { ...state, loader_version: action.payload };
        case "minecraft": 
            return { ...state, minecraft: action.payload };
        case "name":
            return { ...state, name: action.payload };
        case "dot_minecraft": 
            return { ...state, dot_minecraft: action.payload };
        case "add_link": {
            let data = { ...state };
            data.media.links.push(action.payload);
            return data;
        }
        case "resolution_height":{
            let data = { ...state };
            if(!data.resolution) data.resolution = { width: 854, height: 480 };
            data.resolution.height = action.payload;
            return data;
        }
        case "resolution_width":{
            let data = { ...state };
            if(!data.resolution) data.resolution = { width: 854, height: 480 };
            data.resolution.width = action.payload;
            return data;
        }
        case "icon": {
            let data = { ...state };
            data.media.icon = action.payload;
            return data;
        }
        case "banner":{
            let data = { ...state };
            data.media.banner = action.payload;
            return data;
        }
        case "card":{
            let data = { ...state };
            data.media.card = action.payload;
            return data;
        }
        case "remove_link":{
            let data = { ...state };
            data.media.links = data.media.links.filter((_link,i)=> i !== action.payload);
            return data;
        }
        case "reset":
            return {...formDefaultState};
        default:
            return state;
    }
}

export default function CreateProfileDialog() {
    const [open, setOpen] = useRecoilState(create_profile);
    const [formData, dispatch] = useReducer(formReducer,formDefaultState);
    const [tab, setTab] = useState<number>(0);
    const { data, error, isLoading } = useQuery("mc_versions", () => get_minecraft_versions());
    const loader_versions = useQuery("mc_loader_versions", () => get_loader_versions(formData.loader), { enabled: !!formData.loader } );

    const changeTab = (_event: React.SyntheticEvent, value: number) => setTab(value);
    const handleClose = () => setOpen(false);

    const setJava = async () => {
        const window = await dialog.open({ multiple: false, filters: [{ extensions: ["exe"], name: "Application" }] });
        dispatch({ type: "java", payload: window });
    }
    const setGameDir = async () => {
        const window = await dialog.open({ multiple: false, directory: true });
        dispatch({ type: "dot_minecraft", payload: window });
    }
    
    const createLink = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        dispatch({ type: "add_link", payload: { route: data.get("route"), name: data.get("name") } });
    }

    const removeLink = (key: number) => {
        dispatch({ type: "remove_link", payload: key });
    }

    const clear = () => {
        handleClose();
        dispatch({ type: "reset", payload: null });
    }

    const submit = async () => {
        handleClose();
    }
    
    return (
            <Dialog open={open} onClose={handleClose} scroll="paper" fullWidth>
                <DialogTitle>Create Profile</DialogTitle>
                <DialogContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tab} onChange={changeTab}>
                                <Tab label="General"></Tab>
                                <Tab label="Advanced"></Tab>
                                <Tab label="Media"></Tab>
                            </Tabs>
                        </Box>
                        <TabPanel id={0} tab={tab}>
                            <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                                <FormControl fullWidth>
                                    <TextField value={formData.name} onChange={(event)=>dispatch({ type: "name", payload: event.target.value })} name="name" label="Name"></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                    <TextField value={formData.category} onChange={(event)=>dispatch({ type: "category", payload: event.target.value })} name="category" label="Category"></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                    <InputLabel id="minecraft-modloader">ModLoader</InputLabel>
                                    <Select onChange={(event)=> dispatch({ type: "loader", payload: event.target.value })} value={formData.loader} name="loader" labelId='minecraft-modloader'>
                                        <MenuItem value="vanilla">Vanilla</MenuItem>
                                        <MenuItem value="optifine">OptiFine</MenuItem>
                                        <MenuItem value="forge">Forge</MenuItem>
                                        <MenuItem value="fabric">Fabric</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                    <InputLabel id="minecraft-version">Minecraft</InputLabel>
                                    <Select value={formData.minecraft} onChange={(event)=>dispatch({ type: "minecraft", payload: event.target.value })} name="minecraft" labelId='minecraft-version'>
                                        <MenuItem value="latest-release">Latest Release</MenuItem>
                                        {data?.map((version,i)=>(
                                            <MenuItem key={i} value={version.minecraft}>{version.minecraft}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </TabPanel>
                        <TabPanel id={1} tab={tab}>
                            <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                                    <TextField onChange={(event)=>dispatch({ type: "jvm_args", payload: event.target.value })} value={formData.jvm_args} name="jvm_args" label="JVM Arguments"/>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                    <InputLabel id="modloader-version">ModLoader Version</InputLabel>
                                    <Select onChange={(event)=>dispatch({ type: "loader_version", payload: event.target.value })} value={formData.loader_version ?? "latest"} labelId='modloader-version'>
                                        <MenuItem value="latest">Latest</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ marginTop: "10px" }}>
                                    <Typography>Screen resolution</Typography>
                                    <Box sx={{ marginTop: "10px", width: "100%", display: "flex" }}>
                                        <TextField onChange={(event)=>dispatch({ type: "resolution_width", payload: (event.target as HTMLInputElement).valueAsNumber })} value={ formData.resolution?.width ?? 854 } fullWidth InputLabelProps={{ shrink: true }} type="number" label="Width" />
                                        <TextField onChange={(event)=>dispatch({ type: "resolution_height", payload: (event.target as HTMLInputElement).valueAsNumber })} value={ formData.resolution?.height ?? 480 } fullWidth InputLabelProps={{ shrink: true }} type="number" label="Height"/>
                                    </Box>
                                </FormControl>
                                <PickFile clickEvent={setGameDir} sx={{ marginTop: "10px" }} label="Game Dir" defaultValue={formData.dot_minecraft ?? ".minecraft"} btnText="Open Dir"/>
                                <PickFile clickEvent={setJava} sx={{ marginTop: "10px" }} label="Java Exec" defaultValue={formData.java ?? "Bundled Runtime"}/>
                            </Box>
                        </TabPanel>
                        <TabPanel id={2} tab={tab}>
                            <Box role="tabpanel" sx={{ marginTop: "10px", display: "flex", flexDirection: "column" }}>
                                <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                    <TextField onChange={(event)=>dispatch({ type: "icon", payload: event.target.value })} value={formData.media.icon ?? ""} label="Icon"></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                    <TextField onChange={(event)=>dispatch({ type: "banner", payload: event.target.value })} value={formData.media.banner ?? ""} label="Banner"></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                    <TextField onChange={(event)=>dispatch({ type: "card", payload: event.target.value })} value={formData.media.card ?? ""} label="Card"></TextField>
                                </FormControl>
                                <FormControl fullWidth sx={{ marginTop: "15px" }}>
                                        <Typography sx={{ marginBottom: "10px" }}>Links</Typography>
                                        <form onSubmit={createLink}>
                                            <Box sx={{ display: "flex", width: "100%", marginBottom: "15px" }}>
                                                <TextField required name="name" fullWidth label="Name"/>
                                                <TextField required name="route" fullWidth type="url" label="Url"/>
                                            </Box>
                                            <Button fullWidth variant="contained" color="success" type="submit">Add Link</Button>
                                        </form>
                                        <List dense>
                                            {formData.media.links.map((value,i)=>(
                                                <ListItem key={i} secondaryAction={<IconButton edge="end" onClick={()=>removeLink(i)}><DeleteIcon color="error"/></IconButton>}>
                                                    <ListItemButton href={value.route} target="_blank">{value.name}</ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                </FormControl>
                            </Box>
                        </TabPanel> 
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={handleClose}>Cancel</Button>
                    <Button color="success" onClick={submit}>Create</Button>
                </DialogActions>
            </Dialog>
        );
}