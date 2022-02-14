import { atom, useRecoilState } from 'recoil';
import { dialog } from '@tauri-apps/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, Select, MenuItem, InputLabel, Typography, Box } from '@mui/material';
import { useReducer } from 'react';
import { Loader } from '../lib/db';

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
    jvm_args: string
}

const formDefaultState: FormState = {
    name: "",
    category: "",
    minecraft: "",
    loader: "vanilla",
    loader_version: "",
    java: "Bundled Runtime",
    jvm_args: "-Xmx2G -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M"
}

const formReducer = (state: FormState, action: { type: "reset" | "name" | "category" | "minecraft" | "loader" | "loader_version" | "java" | "jvm_args", payload: any }) => {
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
        case "reset":
            return {...formDefaultState};
        default:
            return state;
    }
}

export default function CreateProfileDialog() {
    const [open, setOpen] = useRecoilState(create_profile);
    const [formData, dispatch] = useReducer(formReducer,formDefaultState);

    const onClose = () => setOpen(false);

    const setJava = async () => {
        const window = await dialog.open({ multiple: false, filters: [{ extensions: ["exe"], name: "Application" }] });
        dispatch({ type: "java", payload: window });
    }

    const clear = () => {
        onClose();
        dispatch({ type: "reset", payload: null });
    }

    const submit = async () => {
        onClose();
    }
    
    return (
        <Dialog open={open} onClose={onClose} scroll="paper" fullWidth>
            <DialogTitle>Create Profile</DialogTitle>
            <DialogContent dividers={true} sx={{ display: "flex", flexDirection: "column" }}>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <TextField value={formData.name} onChange={(event)=>dispatch({ type: "name", payload: event.target.value })}  margin='dense' label="Profile Name"/>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <TextField value={formData.category} onChange={(event)=>dispatch({ type: "category", payload: event.target.value })} margin='dense' label="Category"/>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <InputLabel id="minecraft-version">Minecraft</InputLabel>
                    <Select value={formData.minecraft} onChange={(event)=>dispatch({ type: "minecraft", payload: event.target.value })} labelId='minecraft-version'>
                        <MenuItem value="1.18.1">1.18.1</MenuItem>
                        <MenuItem value="1.18">1.18</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <InputLabel id="minecraft-modloader">Mod Loader</InputLabel>
                    <Select value={formData.loader} onChange={(event)=>dispatch({ type: "loader", payload: event.target.value })} labelId='minecraft-modloader'>
                        <MenuItem value="vanilla">Vanilla</MenuItem>
                        <MenuItem value="optifine">OptiFine</MenuItem>
                        <MenuItem value="fabric">Fabric</MenuItem>
                        <MenuItem value="forge">Forge</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <InputLabel id="minecraft-modloader-version">Mod Loader Version</InputLabel>
                    <Select value={formData.loader_version} onChange={(event)=>dispatch({ type: "loader_version", payload: event.target.value })} labelId='minecraft-modloader-version'>
                        <MenuItem disabled>Not a mod loader</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <TextField margin='dense' label="JVM Arguments" value={formData.jvm_args} onChange={(event)=>dispatch({ type: "jvm_args", payload: event.target.value })}/>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <Typography sx={{ marginBottom: "5px" }}>Java Exec</Typography>
                    <Box id="file-input" sx={{ display: "flex", flexDirection: "row", alignItems: "center", alignContent: "center" }}> 
                        <Button sx={{ marginRight: "10px" }} variant='contained' size="medium" onClick={setJava}>Open File</Button><Typography>{formData.java}</Typography>
                    </Box>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={clear}>Cancel</Button>
                <Button color="success" onClick={submit}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}