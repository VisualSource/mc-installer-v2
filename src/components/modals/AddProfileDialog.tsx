import { Tooltip, FormControlLabel, Checkbox, Button, Dialog, DialogActions, DialogContent, InputLabel, MenuItem, Select, FormControl, DialogTitle, TextField, Typography, List, ListItemButton, ListItem, Box, IconButton } from "@mui/material";
import { useRecoilState, useSetRecoilState } from "recoil";
import DB, {Loader, MCVersion, minecraft_loaders} from '../../core/db';
import { add_profile_dialog, message_dialog } from "../state/stateKeys";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { get_fabric_verions, get_forge_verions  } from '../../core/cmds';

export function capitalize(value: string): string {
    return value[0].toUpperCase() + value.toLowerCase().substring(1);
}

export default function AddProfileDialog(){
    const setMessage = useSetRecoilState(message_dialog);
    const [show,setShow] = useRecoilState(add_profile_dialog);
    const [versions_list,setVersionsList] = useState<string[]>([]);
    const [links,setLinks] = useState<{ path: string, name: string }[]>([]);
    const [linkName,setLinkName] = useState<string>("");
    const [linkPath,setLinkPath] = useState<string>("");
    const [icon,setIcon] = useState<string>("");
    const [listImage,setListImage] = useState<string>("");
    const [bgImage,setBGImage] = useState<string>("");
    const [category,setCategory] = useState<string>("General");
    const [description,setDescription] = useState<string>("");
    const [mcv,setMCV] = useState<MCVersion>("1.18.1");
    const [loader,setLoader] = useState<Loader>("fabric");
    const [allowEdit,setAllowEdit] = useState<boolean>(true);
    const [allowDelete,setAllowDelete] = useState<boolean>(true);
    const [name,setName] = useState<string>("");
    const handleClose = () => setShow(false);


    useEffect(()=>{
        const run = async () => {
            try {
                switch (loader) {
                    case "fabric": {
                        let verisons = await get_fabric_verions();
                        setVersionsList(verisons.versions.map(value=>value.version));
                        break;
                    }
                    case "forge": {
                        let versions = await get_forge_verions();
                        setVersionsList(versions.versions);
                        break;
                    }
                    case "vanilla": {
                        break;
                    }
                    default: {
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        run();
    },[loader]);

    const createProfile = async () => {
        try {
            const db = new DB();

            await db.addProfile({
                name,
                uuid: nanoid(),
                mods: [],
                last_played: null,
                loader,
                mc: mcv,
                modpack_uuid: null,
                links,
                media: {
                    icon: icon.length === 0 ? null : icon ?? null,
                    list: listImage.length === 0 ? null : listImage ?? null,
                    background: bgImage.length === 0 ? null : bgImage ?? null
                },
                description,
                category,
                can_delete: allowDelete,
                can_edit: allowEdit
            });
            setMessage({
                title: "Success",
                msg: `Created new profile (${name})`,
                show: true
            });
            handleClose();
        } catch (error) {
            console.error("Failed to create profile",error);
            setMessage({
                title: "Error",
                msg: `Failed to create new profile.`,
                show: true
            });
        }
    }

    return (
        <Dialog open={show} onClose={handleClose} fullWidth>
            <DialogTitle>Create new Profile</DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <TextField value={name} onChange={event=>setName(event.target.value)} required label="Profile name" margin="dense" type="text" variant="standard" autoFocus id="name"/>
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
                    <TextField value={listImage} onChange={event=>setListImage(event.currentTarget.value)} label="List image" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={icon} onChange={event=>setIcon(event.currentTarget.value)} label="Icon" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={bgImage} onChange={event=>setBGImage(event.currentTarget.value)} label="Background image" margin="dense" type="url" variant="standard" autoFocus id="name"/>
                    <TextField value={category} onChange={event=>setCategory(event.currentTarget.value)} required label="Category" margin="dense" type="text" variant="standard" autoFocus id="category"/>
                    <TextField value={description} onChange={event=>setDescription(event.currentTarget.value)} id="description" label="Description" multiline rows={4} variant="standard"/>
                </FormControl>
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <Typography variant="h6">Links</Typography>
                    <Box sx={{ width: "100%", display: "flex"}}>
                        <TextField value={linkName} onChange={(event)=>setLinkName(event.currentTarget.value)} fullWidth label="Link name" margin="dense" type="text" variant="standard" autoFocus id="link_name"/>
                        <TextField value={linkPath} onChange={(event)=>setLinkPath(event.currentTarget.value)} fullWidth label="Link path" margin="dense" type="url" variant="standard" autoFocus id="path"/>
                    </Box>
                    <Button sx={{ marginTop: "10px" }} variant="contained" onClick={()=>{
                        setLinks([...links,{ name: linkName, path: linkPath  }]);
                        setLinkName("");
                        setLinkPath("");
                    }}>Add</Button>
                    <List>
                        {links.map((link,i)=>(
                            <ListItem key={i} secondaryAction={
                                <IconButton sx={{ borderRadius: 0 }} onClick={()=>{
                                    setLinks(links.filter((_,key)=>key!==i));
                                }} color="error" edge="end" aria-label="delete">
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
                        <Select value={mcv} onChange={event=>setMCV(event.target.value as MCVersion)} label="Minecraft" labelId="profile-mc" id="mc">
                            {versions_list.map((version,i)=>(
                                <MenuItem value={version} key={i}>{version}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ marginTop: "10px" }}>
                        <InputLabel id="profile-loader">Loader</InputLabel>
                        <Select value={loader} onChange={event=>setLoader(event.target.value as Loader)} label="Loader" labelId="profile-loader" id="loader">
                            {minecraft_loaders.map((value,i)=>(
                                <MenuItem value={value} key={i}>{capitalize(value)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormControl>
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <Typography variant="h6">Editing</Typography>
                    <Box sx={{display:"flex", alignContent: "center", alignItems: "center" }}>
                        <FormControlLabel control={<Checkbox checked={allowEdit} onChange={event=>setAllowEdit(event.target.checked)} />} label="Allow edits" />
                        <Tooltip title="Allows for adding/removing mods changing name, minecraft version, and loader.">
                            <IconButton>
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{display:"flex", alignContent: "center", alignItems: "center" }}>
                        <FormControlLabel control={<Checkbox checked={allowDelete} onChange={event=>setAllowDelete(event.target.checked)} />} label="Allow deletion" />
                        <Tooltip title="This options stop you from deleting it.">
                            <IconButton>
                                <InfoIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={handleClose}>CANAL</Button>
                <Button color="success" onClick={createProfile}>CREATE</Button>
            </DialogActions>
        </Dialog>
    );
}