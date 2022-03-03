import { atom, useRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, Box, Tab, Tabs } from '@mui/material';
import { useReducer, useState } from 'react';

import { type ICreatableProfile, Database, MinecraftProfile, JVM_ARGS } from '../../lib/db';
import GeneralTab from '../ProfileEdit/GeneralTab';
import AdvancedTab from '../ProfileEdit/AdvancedTab';
import MediaTab from '../ProfileEdit/MediaTab';

export const create_profile = atom({
    key: "create_profile",
    default: false
}); 

const defaultState: ICreatableProfile = {
    name: "Minecraft",
    category: "General",
    minecraft: "latest-release",
    loader: "vanilla",
    loader_version: "latest-release",
    dot_minecraft: null,
    java: null,
    media: {
        links: [],
        icon: null,
        card: null,
        banner: null
    },
    resolution: null,
    jvm_args: JVM_ARGS
}

const stateReducer = (state: ICreatableProfile, action: { type: string, payload: any }): ICreatableProfile => {
    switch (action.type) {
        case "set_minecraft_version": {
            state.minecraft = action.payload;
            return { ...state };
        }
        case "set_modloader": {
            state.loader = action.payload;
            return { ...state };
        }
        case "set_name": {
            state.name = action.payload;
            return { ...state };
        }
        case "set_category": {
            state.category = action.payload;
            return { ...state };
        }
        case "set_java": {
            state.java = action.payload;
            return {...state};
        }
        case "set_game_dir": {
            state.dot_minecraft = action.payload;
            return {...state};
        }
        case "set_jvm_args":{
            state.jvm_args = action.payload;
            return {...state};
        }
        case "set_loader_version": {
            state.loader_version = action.payload;
            return {...state};
        }
        case "set_resolution_width":{
            if(state.resolution) {
                state.resolution.width = action.payload;
            } else {
                state.resolution = { width: action.payload, height: 480 };
            }
            return {...state};
        }
        case "set_resolution_height":{
            if(state.resolution) {
                state.resolution.height = action.payload;
            } else {
                state.resolution = { height: action.payload, width: 854 };
            }
            return {...state};
        }
        case "set_icon": {
            state.media.icon = action.payload;
            return {...state};
        }
        case "set_banner": {
            state.media.banner = action.payload;
            return {...state};
        }
        case "set_card": {
            state.media.card = action.payload;
            return {...state};
        }
        case "add_link": {
            state.media.links.push(action.payload);
            return {...state};
        }
        case "remove_link": {
            state.media.links = state.media.links.filter((_link,i)=> i !== action.payload);
            return {...state};
        }
        case "reset": {
            return defaultState;
        }
        default:
            return state;
    }
}

export default function CreateProfileDialog() {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<number>(0);
    const [open, setOpen] = useRecoilState(create_profile);
    const [state, dispatch ] = useReducer(stateReducer,defaultState);
    const create = useMutation((data: ICreatableProfile)=>Database.createProfile(data), { 
        onSuccess: data => {
            queryClient.setQueryData(["ListText","profiles"],data.category);
            queryClient.setQueryData(["List","profiles"],data.text);
    } });
    const changeTab = (_event: React.SyntheticEvent, value: number) => setTab(value);
    const handleClose = () => setOpen(false);

    const clear = () => {
        handleClose();
        dispatch({ type: "reset", payload: null });
    }

    const submit = async () => {

        create.mutateAsync({
           ...state,
        });
        
        setTab(0);
        handleClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} scroll="paper" fullWidth>
            <DialogTitle>Create Profile</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={changeTab}>
                        <Tab label="General"/>
                        <Tab label="Advanced"/>
                        <Tab label="Media"/>
                    </Tabs>
                </Box>
                <GeneralTab tab={tab} profile={state as MinecraftProfile} dispatch={dispatch}/>
                <AdvancedTab tab={tab} profile={state as MinecraftProfile} dispatch={dispatch}/>
                <MediaTab tab={tab} profile={state as MinecraftProfile} dispatch={dispatch}/>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={clear}>Cancel</Button>
                <Button color="success" onClick={submit}>Create</Button>
            </DialogActions>
        </Dialog>   
    );
}